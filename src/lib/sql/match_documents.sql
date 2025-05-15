-- ベクトル検索を行うためのストアドプロシージャ
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  file_name text,
  page_num int,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.file_name,
    documents.page_num,
    documents.content,
    (documents.embedding <#> query_embedding) * -1 AS similarity
  FROM documents
  WHERE (documents.embedding <#> query_embedding) * -1 > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 