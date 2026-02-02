use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres, Row};
use chrono::{Duration, Utc};
use uuid::Uuid;
use std::env;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateTestRequest {
    test_code: String,
    encrypted_test_data: serde_json::Value,
    duration_minutes: i32,
    allow_corrections: bool,
    teacher_id: String,
}

#[derive(Serialize)]
struct CreateTestResponse {
    success: bool,
    message: String,
    expires_at: String,
    test_code: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let pool = establish_db_pool().await?;
    
   let request: CreateTestRequest = match serde_json::from_slice(req.body()) {
    Ok(req) => req,
    // Instead of Body::Text("JSON Error..."), return a JSON object
Err(e) => {
    let error_map = serde_json::json!({
        "success": false,
        "message": format!("JSON Mismatch: {}", e)
    });
    return Ok(Response::builder()
        .status(StatusCode::BAD_REQUEST)
        .header("Content-Type", "application/json")
        .body(Body::Text(error_map.to_string()))?);
}
};
    if request.test_code.len() != 6 || !request.test_code.chars().all(char::is_numeric) {
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Body::Text("Test code must be 6 digits".into()))?);
    }
    
    if request.duration_minutes < 1 || request.duration_minutes > 240 {
        return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Body::Text("Duration must be between 1 and 240 minutes".into()))?);
    }
    
    let start_test_time = Utc::now();
    let expires_at = start_test_time + 
        Duration::minutes(request.duration_minutes as i64) + 
        Duration::minutes(10);
    
    let teacher_uuid = Uuid::parse_str(&request.teacher_id)
        .map_err(|e| Error::from(format!("Invalid teacher ID: {}", e)))?;
    
    let result = sqlx::query(
        r#"
        INSERT INTO tests (
            test_code, 
            encrypted_test_data, 
            duration_minutes, 
            start_test_time, 
            expires_at,
            allow_corrections,
            teacher_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (test_code) DO NOTHING
        RETURNING id
        "#
    )
    .bind(&request.test_code)
    .bind(&request.encrypted_test_data)
    .bind(request.duration_minutes)
    .bind(start_test_time)
    .bind(expires_at)
    .bind(request.allow_corrections)
    .bind(teacher_uuid)
    .fetch_optional(&pool)
    .await;

    match result {
        Ok(Some(_row)) => {
            let response = CreateTestResponse {
                success: true,
                message: "Test created successfully".into(),
                expires_at: expires_at.to_rfc3339(),
                test_code: request.test_code.clone(),
            };
            
            Ok(Response::builder()
                .status(StatusCode::CREATED)
                .header("Content-Type", "application/json")
                .body(Body::Text(serde_json::to_string(&response)?))?)
        }
        Ok(None) => {
            Ok(Response::builder()
                .status(StatusCode::CONFLICT)
                .body(Body::Text("Test code already exists".into()))?)
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