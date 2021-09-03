INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    date_created
  )
VALUES (
    5,
    'Bitchip',
    'cras non velit nec nisi vulputate nonummy maecenas tincidunt lacus at velit vivamus vel nulla eget eros elementum pellentesque quisque porta volutpat erat quisque erat eros viverra eget congue eget semper rutrum nulla nunc purus phasellus in felis donec semper sapien a libero nam dui proin',
    '/^(.*_?)phone(_.*)?$/gm',
    '2020-08-26 20:16:12'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    is_public,
    date_created
  )
VALUES (
    3,
    'Hatity',
    'in hac habitasse platea dictumst aliquam augue quam sollicitudin vitae consectetuer eget rutrum at lorem integer tincidunt ante vel ipsum praesent blandit lacinia erat vestibulum sed magna at nunc commodo placerat praesent blandit nam nulla integer pede justo lacinia eget tincidunt eget tempus',
    '/\b0+\B/mg',
    TRUE,
    '2020-11-01 17:55:27'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    is_public,
    date_created
  )
VALUES (
    1,
    'Canadian Postal Code',
    'The postal code is a six-character code defined and maintained by Canada Post Corporation (CPC) for the purpose of sorting and delivering mail. The characters are arranged in the form ‘ANA NAN’, where ‘A’ represents an alphabetic character and ‘N’ represents a numeric character (e.g., K1A 0T6). The postal code uses 18 alphabetic characters and 10 numeric characters. Postal codes do not include the letters D, F, I, O, Q or U, and the first position also does not make use of the letters W or Z.',
    '/^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z][ ]?[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/',
    TRUE,
    '2020-09-12 20:07:37'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    is_public,
    date_created
  )
VALUES (
    5,
    'Konklux',
    'libero convallis eget eleifend luctus ultricies eu nibh quisque id justo sit amet sapien dignissim vestibulum vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae nulla dapibus dolor vel est donec odio justo sollicitudin ut suscipit a',
    '/<.*?>/gi',
    false,
    '2021-05-17 00:06:01'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    is_public,
    date_created
  )
VALUES (
    5,
    'Skype Name',
    'praesent id massa id nisl venenatis lacinia aenean sit amet justo morbi ut odio cras mi pede malesuada in imperdiet et commodo vulputate justo in blandit ultrices enim lorem ipsum dolor sit amet',
    '/^[a-z][a-z0-9\.,\-_]{5,31}$/i',
    false,
    '2021-08-27 08:09:22'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    4,
    'Cardguard',
    'vel augue vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae donec pharetra magna vestibulum aliquet ultrices erat tortor sollicitudin mi sit amet lobortis sapien sapien non',
    '/\b([^aeiou\s]+)\b/ig',
    NULL,
    false,
    '2020-11-15 06:13:06'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    1,
    'Password Validation',
    'Checks that a password has a minimum of 6 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number with no spaces.',
    '/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/',
    NULL,
    TRUE,
    '2021-01-31 02:35:34'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    3,
    'Phone Numbers',
    'Detects most of the phone numbers all over the world',
    '/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g',
    1,
    '2020-12-25 01:12:54'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    1,
    'Spanish DNI/NIE check first pass',
    NULL,
    '/^(x?\d{8}|[xyz]\d{7})[trwagmyfpdxbnjzsqvhlcke]$/i',
    NULL,
    false,
    '2020-09-20 09:49:01'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    3,
    'Tresom',
    'nisl duis ac nibh fusce lacus purus aliquet at feugiat non pretium quis lectus suspendisse potenti in eleifend quam a odio in hac habitasse',
    '/([#.a-z]{1}[a-z_]{1}[\s\S]+?){([\s\S]*?)}/g',
    NULL,
    '2021-02-21 08:35:07'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    2,
    'Mat Lam Tam',
    'integer a nibh in quis justo maecenas rhoncus aliquam lacus morbi quis tortor id nulla ultrices aliquet maecenas leo odio condimentum id luctus nec molestie sed justo pellentesque',
    '/#\w+/g',
    NULL,
    false,
    '2021-08-25 04:33:14'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    5,
    'Stronghold',
    'eu massa donec dapibus duis at velit eu est congue elementum in hac habitasse platea dictumst morbi vestibulum velit id pretium iaculis diam',
    '/(^[0-9]{4}?[0-9]$|^[0-9]{4}?[0-9]-[0-9]{4}$)/gm',
    7,
    '2021-01-26 17:25:39'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    3,
    'Aerified',
    'congue eget semper rutrum nulla nunc purus phasellus in felis donec semper sapien a libero nam dui proin leo odio porttitor id',
    '/^(0[1-9]|1[0-2])(\/|-)([0-9]{4})$/gm',
    NULL,
    '2021-08-21 11:16:44'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    5,
    'Y-Solowarm',
    'nibh in quis justo maecenas rhoncus aliquam lacus morbi quis tortor id nulla ultrices aliquet maecenas leo odio condimentum id luctus nec molestie sed justo',
    '/^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/mg',
    NULL,
    '2021-07-27 09:05:14'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    2,
    'Sonair',
    'vel pede morbi porttitor lorem id ligula suspendisse ornare consequat lectus in est risus auctor sed tristique in tempus sit amet sem fusce consequat nulla',
    '/^(?=.{3,20}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9_-]+([^._-])$/',
    NULL,
    '2021-02-27 18:03:58'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    5,
    'Tin',
    'quam a odio in hac habitasse platea dictumst maecenas ut massa quis augue luctus tincidunt nulla mollis molestie lorem quisque ut erat curabitur gravida',
    '/^[0-9]*(\.[0-9][0-9])?$/',
    NULL,
    TRUE,
    '2021-06-12 23:03:16'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    5,
    'Aerified',
    'turpis eget elit sodales scelerisque mauris sit amet eros suspendisse accumsan tortor quis turpis sed ante vivamus tortor duis mattis egestas metus aenean fermentum donec ut mauris eget massa tempor convallis nulla neque libero',
    '/([£\$])*([\d,.]*)/g',
    NULL,
    '2021-08-29 10:10:23'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    is_public,
    date_created
  )
VALUES (
    1,
    'Keylex',
    'condimentum curabitur in libero ut massa volutpat convallis morbi odio odio elementum eu interdum eu tincidunt in leo maecenas pulvinar lobortis est phasellus sit amet erat nulla tempus vivamus in felis eu sapien cursus vestibulum proin eu mi nulla ac enim in tempor turpis nec euismod scelerisque',
    '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/',
    NULL,
    TRUE,
    '2021-05-17 01:49:24'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    2,
    'Simple Number',
    'Verifies Number is a negative/positive number. Number may be a decimal, but if it is, it requires at least one number before and after the decimal place. Decimal numbers may also be negative or positive. Only 1 decimal place is allowed',
    '/^[\-]{0,1}[0-9]+[\.][0-9]+|[\-]{0,1}[0-9]+$/g',
    8,
    '2021-03-01 17:25:54'
  );

INSERT INTO regexes (
    user_id,
    title,
    notes,
    regex,
    fork_of,
    date_created
  )
VALUES (
    5,
    'Biodex',
    'condimentum id luctus nec molestie sed justo pellentesque viverra pede ac diam cras pellentesque volutpat dui maecenas tristique est et tempus semper est quam pharetra magna ac consequat metus sapien ut nunc vestibulum ante ipsum',
    '/(me)(?!([^<]+)?>)/gi',
    NULL,
    '2020-12-16 08:15:09'
  );