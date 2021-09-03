DROP TABLE IF EXISTS regexes CASCADE;

CREATE TABLE regexes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  regex VARCHAR(255),
  weighted_tsv TSVECTOR,
  fork_of INTEGER REFERENCES regexes(id),
  is_public BOOLEAN DEFAULT TRUE,
  date_created TIMESTAMP DEFAULT NOW(),
  date_edited TIMESTAMP DEFAULT NOW()
);