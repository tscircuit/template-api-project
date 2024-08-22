CREATE TABLE
  public.soup (
    soup_id uuid NOT NULL DEFAULT gen_random_uuid (),
    soup_group_id uuid NOT NULL DEFAULT NULL,
    soup_name text NOT NULL DEFAULT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content jsonb NOT NULL DEFAULT NULL
  );

;

CREATE UNIQUE INDEX soup_pkey ON public.soup USING btree (soup_id);