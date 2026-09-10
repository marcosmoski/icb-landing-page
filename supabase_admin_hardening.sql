-- ========================================
-- Admin access hardening
-- Applied via migration: restrict_members_and_prayers_to_admin_whitelist
-- ========================================
--
-- Problem this fixes: membros_igreja and pedidos_oracao carried old policies with
-- USING (true) for the `authenticated` role. Since RLS policies are OR'd together,
-- those cancelled out the admin_whitelist policies entirely — any account that could
-- sign up with the public anon key could read every registration and every prayer
-- request (personal data, and religious conviction data under RGPD art. 9).
--
-- The rule from here on: every admin-side SELECT/UPDATE/DELETE goes through
-- is_admin(). Public INSERT stays open, because those are the site's own forms.
--
-- is_admin() is defined in supabase_surveys.sql.

-- ========== membros_igreja ==========
DROP POLICY IF EXISTS allow_authenticated_all_v2 ON membros_igreja;
DROP POLICY IF EXISTS allow_authenticated_select ON membros_igreja;
DROP POLICY IF EXISTS allow_authenticated_update ON membros_igreja;
DROP POLICY IF EXISTS allow_authenticated_delete ON membros_igreja;
DROP POLICY IF EXISTS "Admin pode ver membros" ON membros_igreja;
DROP POLICY IF EXISTS "Admin pode atualizar membros" ON membros_igreja;
DROP POLICY IF EXISTS "Admin pode deletar membros" ON membros_igreja;
DROP POLICY IF EXISTS allow_admin_select_membros ON membros_igreja;
DROP POLICY IF EXISTS allow_admin_update_membros ON membros_igreja;
DROP POLICY IF EXISTS allow_admin_delete_membros ON membros_igreja;

CREATE POLICY allow_admin_select_membros
ON membros_igreja FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY allow_admin_update_membros
ON membros_igreja FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY allow_admin_delete_membros
ON membros_igreja FOR DELETE TO authenticated
USING (is_admin());

-- ========== pedidos_oracao ==========
DROP POLICY IF EXISTS allow_authenticated_select_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_authenticated_update_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_authenticated_delete_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_admin_select_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_admin_update_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_admin_delete_prayer ON pedidos_oracao;

CREATE POLICY allow_admin_select_prayer
ON pedidos_oracao FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY allow_admin_update_prayer
ON pedidos_oracao FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY allow_admin_delete_prayer
ON pedidos_oracao FOR DELETE TO authenticated
USING (is_admin());

-- Grant access to a new person by adding their login e-mail here:
--   INSERT INTO admin_whitelist (email) VALUES ('pessoa@exemplo.com')
--   ON CONFLICT (email) DO NOTHING;
-- Revoke by deleting the row. Nothing else is needed.
