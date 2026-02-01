use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres, Row};
use chrono::Utc;
use uuid::Uuid;
use std::env;

#[derive(Deserialize)]
struct SubmitRequest {
    test_code: String,
    encrypted_submission_data: serde_json::Value,
    time_logs: serde_json::Value,
    student_name: Option<String>,
}

#[derive(Serialize)]
struct SubmitResponse {
    success: bool,
    suspicious: bool,
    submission_id: Option<String>,
    message: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let pool = establish_db_pool().await?;
    
    let request: SubmitRequest = match serde_json::from_slice(req.body()) {
        Ok(req) => req,
        Err(_) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Body::Text("Invalid JSON".into()))?);
        }
    };
    
    let test_row = match sqlx::query("SELECT id FROM tests WHERE test_code = $1")
        .bind(&request.test_code)
        .fetch_optional(&pool)
        .await {
            Ok(Some(row)) => row,
            Ok(None) => {
                return Ok(Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(Body::Text("Test not found".into()))?);
            }
            Err(e) => {
                return Ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::Text(e.to_string().into()))?);
            }
        };
    
    let test_id: Uuid = test_row.get("id");
    let suspicious = validate_time_logs(&request.time_logs);
    let student_name = request.student_name.unwrap_or_else(|| "Anonymous".into());
    
    let insert_result = sqlx::query(
        r#"
        INSERT INTO submissions (
            test_id, 
            student_name, 
            encrypted_submission_data, 
            time_logs, 
            is_suspicious, 
            submitted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        "#
    )
    .bind(test_id)
    .bind(student_name)
    .bind(&request.encrypted_submission_data)
    .bind(&request.time_logs)
    .bind(suspicious)
    .bind(Utc::now())
    .fetch_one(&pool)
    .await;

    match insert_result {
        Ok(record) => {
            let sub_id: Uuid = record.get("id");
            let response = SubmitResponse {
                success: true,
                suspicious,
                submission_id: Some(sub_id.to_string()),
                message: if suspicious {
                    "Submission recorded (flagged for review)".into()
                } else {
                    "Submission successful".into()
                },
            };
            
            Ok(Response::builder()
                .status(StatusCode::CREATED)
                .header("Content-Type", "application/json")
                .body(Body::Text(serde_json::to_string(&response)?))?)
        }
        Err(e) => {
            Ok(Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::Text(e.to_string().into()))?)
        }
    }
}

fn validate_time_logs(time_logs: &serde_json::Value) -> bool {
    let logs_array = match time_logs.as_array() {
        Some(arr) => arr,
        None => return true,
    };
    
    if logs_array.is_empty() { return true; }
    
    let mut suspicious = false;
    let mut prev_exit: Option<f64> = None;
    
    for (i, log) in logs_array.iter().enumerate() {
        let entry = log.get("entry").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let exit = log.get("exit").and_then(|v| v.as_f64());
        
        if let Some(exit_val) = exit {
            if exit_val < entry { suspicious = true; break; }
            if let Some(prev) = prev_exit {
                if entry < prev { suspicious = true; break; }
            }
            prev_exit = Some(exit_val);
            let duration = (exit_val - entry) / 1000.0;
            if duration < 1.0 && i > 0 { suspicious = true; break; }
        }
    }
    suspicious
}

async fn establish_db_pool() -> Result<Pool<Postgres>, Error> {
    let database_url = env::var("DATABASE_URL")
        .map_err(|_| Error::from("DATABASE_URL not set"))?;
    Pool::<Postgres>::connect(&database_url).await
        .map_err(|e| Error::from(format!("Database connection failed: {}", e)))
}