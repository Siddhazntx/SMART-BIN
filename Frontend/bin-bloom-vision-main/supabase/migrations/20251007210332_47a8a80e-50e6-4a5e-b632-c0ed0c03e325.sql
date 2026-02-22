-- Create waste types enum
CREATE TYPE waste_type AS ENUM ('Plastic', 'Organic', 'Paper', 'Metal', 'E-waste', 'Biodegradable', 'Hazardous', 'Recyclable', 'Biomedical');

-- Create dustbin status enum
CREATE TYPE dustbin_status AS ENUM ('Empty', 'Partial', 'Full', 'Overflow');

-- Create vehicle status enum
CREATE TYPE vehicle_status AS ENUM ('Active', 'Idle', 'Maintenance');

-- Create collection request status enum
CREATE TYPE collection_status AS ENUM ('Pending', 'In Progress', 'Completed');

-- Create dustbins table
CREATE TABLE public.dustbins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dustbin_number TEXT UNIQUE NOT NULL,
  status dustbin_status DEFAULT 'Empty',
  fill_level INTEGER DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  location TEXT,
  last_filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create waste classifications table
CREATE TABLE public.waste_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dustbin_id UUID REFERENCES public.dustbins(id) ON DELETE CASCADE,
  detection_time TIMESTAMPTZ DEFAULT now(),
  waste_type waste_type NOT NULL,
  confidence DECIMAL(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  location TEXT,
  camera_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT UNIQUE NOT NULL,
  driver_name TEXT NOT NULL,
  vehicle_type waste_type NOT NULL,
  status vehicle_status DEFAULT 'Idle',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create collection requests table
CREATE TABLE public.collection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dustbin_id UUID REFERENCES public.dustbins(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  status collection_status DEFAULT 'Pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create admins table (simple admin management)
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dustbins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now as admin auth will be added later)
CREATE POLICY "Allow public read access on dustbins" ON public.dustbins FOR SELECT USING (true);
CREATE POLICY "Allow public insert on dustbins" ON public.dustbins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on dustbins" ON public.dustbins FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on dustbins" ON public.dustbins FOR DELETE USING (true);

CREATE POLICY "Allow public read access on waste_classifications" ON public.waste_classifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on waste_classifications" ON public.waste_classifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on waste_classifications" ON public.waste_classifications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on waste_classifications" ON public.waste_classifications FOR DELETE USING (true);

CREATE POLICY "Allow public read access on vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on vehicles" ON public.vehicles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on vehicles" ON public.vehicles FOR DELETE USING (true);

CREATE POLICY "Allow public read access on collection_requests" ON public.collection_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on collection_requests" ON public.collection_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on collection_requests" ON public.collection_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on collection_requests" ON public.collection_requests FOR DELETE USING (true);

CREATE POLICY "Allow public read access on admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admins" ON public.admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on admins" ON public.admins FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on admins" ON public.admins FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_dustbins_updated_at BEFORE UPDATE ON public.dustbins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_requests_updated_at BEFORE UPDATE ON public.collection_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();