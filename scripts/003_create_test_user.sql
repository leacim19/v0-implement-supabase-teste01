-- Criando usuário de teste com email e senha específicos
-- Inserir usuário de teste diretamente na tabela auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'micaeltavares1000@gmail.com',
  crypt('102030', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Inserir perfil correspondente na tabela profiles
INSERT INTO profiles (
  id,
  email,
  nome,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'micaeltavares1000@gmail.com'),
  'micaeltavares1000@gmail.com',
  'Micael Tavares',
  NOW(),
  NOW()
);
