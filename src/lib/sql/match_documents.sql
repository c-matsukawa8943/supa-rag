-- ベクトル検索を行うためのストアドプロシージャ
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
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
    (1 - (documents.embedding <=> query_embedding)) AS similarity
  FROM documents
  WHERE (1 - (documents.embedding <=> query_embedding)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ベクトル正規化関数の作成
CREATE OR REPLACE FUNCTION normalize_embedding(input_vector vector)
RETURNS vector
LANGUAGE plpgsql
AS $$
DECLARE
  magnitude float;
BEGIN
  -- L2ノルムを計算（より適切な方法）
  SELECT sqrt(l2_norm(input_vector)) INTO magnitude;
  -- もしくは下記のように変更
  -- SELECT sqrt(1 - (input_vector <=> input_vector)) INTO magnitude;
  
  IF magnitude > 0 THEN
    RETURN input_vector / magnitude;
  ELSE
    RETURN input_vector;
  END IF;
END;
$$;

-- ベクトル正規化関数の作成後に実行
UPDATE documents
SET embedding = normalize_embedding(embedding);

SELECT l2_norm(embedding) FROM documents LIMIT 5; 