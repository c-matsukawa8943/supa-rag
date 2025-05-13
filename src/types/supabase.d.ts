declare module '@supabase/supabase-js' {
  export function createClient(url: string, key: string): SupabaseClient;

  export interface SupabaseClient {
    from(table: string): Table;
    rpc(
      fn: string,
      params?: Record<string, any>
    ): { data: any; error: Error | null };
  }

  export interface Table {
    select(columns?: string): Query;
    insert(values: Record<string, any>): Query;
    update(values: Record<string, any>): Query;
    delete(): Query;
  }

  export interface Query {
    eq(column: string, value: any): Query;
    order(column: string, options?: { ascending?: boolean }): Query;
    limit(count: number): Query;
    single(): { data: any; error: Error | null };
    select(columns?: string): Query;
  }
} 