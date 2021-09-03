DROP FUNCTION IF EXISTS regexes_weighted_tsv_trigger() CASCADE;

DROP FUNCTION IF EXISTS tags_tsv_trigger() CASCADE;

CREATE FUNCTION regexes_weighted_tsv_trigger() RETURNS TRIGGER AS $$ BEGIN new.weighted_tsv := setweight(
  to_tsvector('english', COALESCE(new.title, '')),
  'A'
) || setweight(
  to_tsvector('english', COALESCE(new.notes, '')),
  'B'
);

RETURN new;

END $$ LANGUAGE plpgsql;

CREATE FUNCTION tags_tsv_trigger() RETURNS TRIGGER AS $$ BEGIN new.tsv := to_tsvector('english', new.tag_name);

RETURN new;

END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS upd_tsvector ON regexes CASCADE;

DROP TRIGGER IF EXISTS upd_tsv ON tags CASCADE;

CREATE TRIGGER upd_tsvector BEFORE
INSERT
  OR
UPDATE ON regexes FOR EACH ROW EXECUTE PROCEDURE regexes_weighted_tsv_trigger();

CREATE TRIGGER upd_tsv BEFORE
INSERT
  OR
UPDATE ON tags FOR EACH ROW EXECUTE PROCEDURE tags_tsv_trigger();

CREATE INDEX weighted_tsv_idx ON regexes USING GIST (weighted_tsv);

CREATE INDEX tsv_idx ON tags USING GIST (tsv);