-- Criar tabela de lotes com RLS
CREATE TABLE IF NOT EXISTS public.lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  produto TEXT NOT NULL,
  quantidade_planejada DECIMAL NOT NULL,
  quantidade_produzida DECIMAL DEFAULT 0,
  unidade TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  materias_primas JSONB NOT NULL DEFAULT '[]',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lotes
CREATE POLICY "lotes_select_own" ON public.lotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lotes_insert_own" ON public.lotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lotes_update_own" ON public.lotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lotes_delete_own" ON public.lotes
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_lotes_user_id ON public.lotes(user_id);
CREATE INDEX idx_lotes_status ON public.lotes(status);
CREATE INDEX idx_lotes_data_criacao ON public.lotes(data_criacao DESC);
