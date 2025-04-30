\c thalitera

GRANT ALL PRIVILEGES ON DATABASE thalitera TO Thalitera;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

create table users
(
    user_id              uuid                                                          not null
        primary key,
    email                varchar(255)                                                  not null
        unique,
    password_hash        varchar(128)                                                  not null,
    status               varchar(20)              default 'pending'::character varying not null,
    mfa_secret           text,
    trusted_devices      jsonb,
    created_at           timestamp with time zone default now()                        not null,
    updated_at           timestamp with time zone default now()                        not null,
    avatar               varchar(255),
    username             varchar(255)                                                  not null
        unique,
    last_password_update timestamp with time zone default now()                        not null,
    mfa_enable           boolean                  default false                        not null
);

alter table users
    owner to Thalitera;

create index idx_users_email
    on users (email);

create table login_history
(
    log_id             bigserial
        primary key,
    user_id            uuid                                   not null,
    login_time         timestamp with time zone default now() not null,
    ip_address         varchar(255),
    device_fingerprint jsonb,
    success            boolean                                not null,
    failure_reason     text,
    location           geography(Point, 4326)
);

alter table login_history
    owner to Thalitera;

create table meeting_rooms
(
    room_id      uuid                     default gen_random_uuid()           not null
        primary key,
    name         varchar(100)                                                 not null,
    capacity_min smallint                                                     not null
        constraint meeting_rooms_capacity_min_check
            check (capacity_min > 0),
    capacity_max smallint                                                     not null,
    building     varchar(50)                                                  not null,
    floor        smallint                                                     not null,
    status       varchar(20)              default 'active'::character varying not null
        constraint meeting_rooms_status_check
            check ((status)::text = ANY
                   ((ARRAY ['active'::character varying, 'maintenance'::character varying, 'deleted'::character varying])::text[])),
    facilities   jsonb                                                        not null,
    created_by   uuid                                                         not null,
    created_at   timestamp with time zone default now()                       not null,
    updated_at   timestamp with time zone default now(),
    image        text,
    constraint meeting_rooms_check
        check (capacity_max >= capacity_min)
);

comment on column meeting_rooms.image is 'Room image URL';

alter table meeting_rooms
    owner to Thalitera;

create table reservations
(
    reservation_id uuid                                                          not null
        primary key,
    user_id        uuid                                                          not null,
    room_id        uuid                                                          not null,
    start_time     timestamp with time zone                                      not null,
    end_time       timestamp with time zone                                      not null,
    purpose        text                                                          not null,
    status         varchar(20)              default 'pending'::character varying not null
        constraint reservations_status_check
            check ((status)::text = ANY
                   (ARRAY [('pending'::character varying)::text, ('confirmed'::character varying)::text, ('canceled'::character varying)::text, ('completed'::character varying)::text])),
    version        integer                  default 0                            not null,
    qr_token       text
        unique,
    created_at     timestamp with time zone default now()                        not null,
    updated_at     timestamp with time zone default now(),
    attendees      jsonb                                                         not null
);


alter table reservations
    owner to Thalitera;

create table reservation_versions
(
    version_id     bigserial
        primary key,
    reservation_id uuid                                   not null,
    snapshot       jsonb                                  not null,
    operation_type varchar(10)                            not null
        constraint reservation_versions_operation_type_check
            check ((operation_type)::text = ANY
                   ((ARRAY ['create'::character varying, 'update'::character varying, 'delete'::character varying])::text[])),
    operated_by    uuid                                   not null,
    operated_at    timestamp with time zone default now() not null
);

alter table reservation_versions
    owner to Thalitera;

create table checkins
(
    checkin_id         uuid                     default gen_random_uuid() not null
        primary key,
    reservation_id     uuid                                               not null,
    user_id            uuid                                               not null,
    checkin_time       timestamp with time zone default now()             not null,
    checkin_type       varchar(20)                                        not null
        constraint checkins_checkin_type_check
            check ((checkin_type)::text = ANY
                   ((ARRAY ['qr'::character varying, 'card'::character varying, 'manual'::character varying])::text[])),
    device_fingerprint jsonb,
    ip_address         inet
);

alter table checkins
    owner to Thalitera;

create table notifications
(
    notification_id bigserial
        primary key,
    type            varchar(50)                            not null,
    recipient       uuid                                   not null,
    content         jsonb                                  not null,
    status          varchar(20)                            not null,
    retries         smallint                 default 0,
    created_at      timestamp with time zone default now() not null,
    failure_reason  varchar(255)
);

alter table notifications
    owner to Thalitera;

create table mfa_recovery_code
(
    id         bigserial
        primary key,
    user_id    uuid                                not null,
    code_hash  varchar(255)                        not null,
    used       boolean   default false             not null,
    created_at timestamp default CURRENT_TIMESTAMP not null
);

alter table mfa_recovery_code
    owner to Thalitera;

create table file_metadata
(
    id            bigserial
        primary key,
    file_key      uuid                                   not null
        unique,
    original_name varchar(255)                           not null,
    content_type  varchar(100),
    size          bigint                                 not null,
    sha256_hash   varchar(64)                            not null,
    bucket        varchar(100)                           not null,
    object_key    varchar(255)                           not null,
    created_at    timestamp with time zone default now() not null,
    uploaded_by   uuid
);

alter table file_metadata
    owner to Thalitera;

