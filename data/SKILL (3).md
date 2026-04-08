---
name: query-validation
description: SQL query review and validation for correctness, performance, and best practices. Use when reviewing queries for logical errors, optimizing query performance, checking for SQL anti-patterns, or validating business logic implementation in SQL.
---

# Query Validation

## Quick Start

Review SQL queries for correctness, performance, and adherence to best practices.

## Context Requirements

1. **SQL Query**: The query to validate
2. **Database Type**: PostgreSQL, MySQL, Snowflake, BigQuery, Redshift, etc.
3. **Schema Information**: Relevant table structures
4. **Business Logic** (optional): What the query should calculate
5. **Performance Context** (optional): Expected row counts, current runtime

## Context Gathering

### For query input:
"Please provide:
1. The SQL query to validate
2. What database system you're using (PostgreSQL, Snowflake, etc.)
3. Relevant table schemas (or I can help you extract them)"

### For schema:
"To validate joins and column references, I need table schemas. You can provide:

**Option 1 - Quick:**
Just the tables/columns used in the query

**Option 2 - Comprehensive:**