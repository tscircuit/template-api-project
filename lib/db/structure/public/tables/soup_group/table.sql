CREATE TABLE
  public.soup_group (
    soup_group_id uuid NOT NULL DEFAULT gen_random_uuid (),
    soup_group_name text NOT NULL DEFAULT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

;

CREATE UNIQUE INDEX soup_group_pkey ON public.soup_group USING btree (soup_group_id);

CREATE UNIQUE INDEX soup_group_soup_group_name_key ON public.soup_group USING btree (soup_group_name);