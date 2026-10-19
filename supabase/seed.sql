
-- Local dev account if it does not already exist
create extension if not exists pgcrypto with schema extensions;

do $$
declare
    dev_user_id uuid;
begin
    select id
    into dev_user_id
    from auth.users
    where email = 'dev@opndigital.org';

    if dev_user_id is null then
        dev_user_id := gen_random_uuid();

        insert into auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        )
        values (
            dev_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'dev@opndigital.org',
            extensions.crypt('password123', extensions.gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"display_name":"dev"}'::jsonb,
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    else
        update auth.users
        set
            encrypted_password = extensions.crypt(
                'password123',
                extensions.gen_salt('bf')
            ),
            email_confirmed_at = coalesce(email_confirmed_at, now()),
            raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                || '{"display_name":"dev"}'::jsonb,
            updated_at = now()
        where id = dev_user_id;
    end if;
end;
$$;
