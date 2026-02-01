use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};
use serde::Serialize;
use sqlx::{Pool, Postgres};
use std::env;

#[derive(Serialize)]
struct FetchResponse {
    success: bool,
    encrypted_test_data: Option<serde_json::Value>,
    duration_minutes: Option<i32>,
    allow_corrections: Option<bool>,
    message: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let pool = establish_db_pool().await?;
    
    let query_string = req.uri().query().unwrap_or("");
    let params: Vec<&str> = query_string.split('&').collect();
    
    let mut test_code = None;
    for param in params {
        if param.starts_with("code=") {
            test_code = Some(param[5..].to_string());
            break;
        }
    }
    
    let test_code = match test_code {
        Some(code) if code.len() == 6 => code,
        _ => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Body::Text("Missing or invalid test code".into()))?);
        }
    };
    
    match sqlx::query!(
        r#"
        SELECT encrypted_test_data, duration_minutes, allow_corrections, expires_at
        FROM tests 
        WHERE test_code = $1 AND expires_at > NOW()
        "#,
        test_code
    )
    .fetch_optional(&pool)
    .await {
        Ok(Some(record)) => {
            let response = FetchResponse {
                success: true,
                encrypted_test_data: Some(record.encrypted_test_data),
                duration_minutes: Some(record.duration_minutes),
                allow_corrections: Some(record.allow_corrections),
                message: "Test fetched successfully".into(),
            };
            
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::Text(serde_json::to_string(&response)?))?)
        }
        Ok(None) => {
            let response = FetchResponse {
                success: false,
                encrypted_test_data: None,
                duration_minutes: None,
                allow_corrections: None,
                message: "Test not found or expired".into(),
            };
            
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .header("Content-Type", "application/json")
                .body(Body::Text(serde_json::to_string(&response)?))?)
        }
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::Text("Internal server error".into()))?)
        }
    }
}

async fn establish_db_pool() -> Result<Pool<Postgres>, Error> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| Error::from("DATABASE_URL not set"))?;
    
    Pool::<Postgres>::connect(&database_url).await
        .map_err(|e| Error::from(format!("Database connection failed: {}", e)))
}