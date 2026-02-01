use vercel_runtime::{run, Body, Error, Request, Response, StatusCode};
use sqlx::{Pool, Postgres};
use std::env;

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}

async fn handler(req: Request) -> Result<Response<Body>, Error> {
    let auth_header = req.headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());
    
    let admin_token = env::var("ADMIN_TOKEN")
        .expect("ADMIN_TOKEN must be set");
    
    if auth_header != Some(&format!("Bearer {}", admin_token)) {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::Text("Unauthorized".into()))?);
    }
    
    let pool = establish_db_pool().await?;
    
    let t = sqlx::query("DELETE FROM tests WHERE expires_at < NOW()").execute(&pool).await?;
    let s = sqlx::query("DELETE FROM submissions WHERE expires_at < NOW()").execute(&pool).await?;
    let c = sqlx::query("DELETE FROM corrections WHERE expires_at < NOW()").execute(&pool).await?;
    
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::Text(format!(
            "Flushed: {} tests, {} submissions, {} corrections",
            t.rows_affected(),
            s.rows_affected(),
            c.rows_affected()
        )))?)
}

async fn establish_db_pool() -> Result<Pool<Postgres>, Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    Pool::<Postgres>::connect(&database_url).await
        .map_err(|e| Error::from(e.to_string()))
}