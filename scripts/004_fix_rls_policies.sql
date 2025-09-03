-- Corrigir políticas RLS para permitir inserção de perfis
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Criar políticas RLS corretas
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitir que usuários autenticados insiram perfis
CREATE POLICY "Allow authenticated users to insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (true);
