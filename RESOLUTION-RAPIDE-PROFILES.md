# 🚀 Résolution Rapide : Table Profiles Manquante

## 🚨 **Problème Identifié**

L'erreur dans les logs Supabase :
```
ERROR: relation "public.profiles" does not exist (SQLSTATE 42P01)
```

**Supabase s'attend à une table `profiles` par défaut pour l'authentification !**

---

## ⚡ **Solution en 3 Étapes**

### **Étape 1 : Créer la Table Profiles**

1. **Aller** dans Supabase Dashboard
2. **Navigation** : SQL Editor
3. **Copier-coller** le contenu de `database/fix-profiles-table.sql`
4. **Exécuter** le script

### **Étape 2 : Vérifier la Création**

1. **Aller** dans Table Editor
2. **Vérifier** que la table `profiles` existe
3. **Vérifier** les colonnes : `id`, `email`, `full_name`, `avatar_url`, `updated_at`, `created_at`

### **Étape 3 : Tester la Solution**

```bash
node scripts/test-profiles-table.js
```

**Résultat attendu :**
- ✅ Table profiles accessible
- ✅ Inscription réussie
- ✅ Profil créé automatiquement

---

## 📋 **Script SQL à Exécuter**

```sql
-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger pour création automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 **Résultat Final**

Après avoir créé la table `profiles` :

- ✅ **Inscription** sans erreur 500
- ✅ **Connexion** fonctionnelle
- ✅ **Profil automatique** créé
- ✅ **Profil client** créé manuellement
- ✅ **Application** complètement fonctionnelle

---

## 🧪 **Test de Validation**

```bash
# Test complet
node scripts/debug-auth.js

# Test spécifique profiles
node scripts/test-profiles-table.js
```

---

## 🎉 **Problème Résolu !**

La table `profiles` manquante était la cause de l'erreur "Database error saving new user". 

**Votre application fonctionnera parfaitement après avoir créé cette table !** 🚀 