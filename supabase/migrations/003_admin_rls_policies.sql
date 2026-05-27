-- RLS write policies for menu_items and categories
-- Allows authenticated users (admin) to insert/update/delete menu items.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/zqwfrhxmlwdwskkdcgwz/sql

-- Admin can insert new menu items
CREATE POLICY "Authenticated users can insert menu items"
  ON menu_items FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admin can update menu items
CREATE POLICY "Authenticated users can update menu items"
  ON menu_items FOR UPDATE TO authenticated
  USING (true);

-- Admin can soft-delete menu items
CREATE POLICY "Authenticated users can delete menu items"
  ON menu_items FOR DELETE TO authenticated
  USING (true);

-- Admin can manage categories
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL TO authenticated
  USING (true);

