DROP TABLE IF EXISTS regexes_tags CASCADE;

CREATE TABLE regexes_tags (
  regex_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY(regex_id, tag_id)
);