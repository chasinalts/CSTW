-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table to store additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('string', 'boolean', 'multiple-choice')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    order INT NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_scanners table to store generated scanners
CREATE TABLE IF NOT EXISTS public.user_scanners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = auth_id);

-- Questions policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can insert questions"
    ON public.questions FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_id = auth.uid()
        AND profiles.is_admin = true
    ));

CREATE POLICY "Only admins can update questions"
    ON public.questions FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_id = auth.uid()
        AND profiles.is_admin = true
    ));

CREATE POLICY "Only admins can delete questions"
    ON public.questions FOR DELETE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_id = auth.uid()
        AND profiles.is_admin = true
    ));

-- User scanners policies
ALTER TABLE public.user_scanners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scanners"
    ON public.user_scanners FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.profiles
            WHERE auth_id = auth.uid()
        )
        OR is_public = true
    );

CREATE POLICY "Users can create their own scanners"
    ON public.user_scanners FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IN (
            SELECT id FROM public.profiles
            WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own scanners"
    ON public.user_scanners FOR UPDATE
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.profiles
            WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own scanners"
    ON public.user_scanners FOR DELETE
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.profiles
            WHERE auth_id = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_scanners_updated_at
    BEFORE UPDATE ON public.user_scanners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();