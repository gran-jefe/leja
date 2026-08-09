-- Fully-fledged property listings: description, photos, amenities so
-- tenants can actually get a feel for a place before contacting the
-- landlord, not just address/beds/baths/rent.
--
-- images: array of external image URLs (no upload/storage pipeline exists
-- yet — landlords paste links to photos hosted elsewhere). Revisit once a
-- Supabase Storage bucket + upload flow is wired up.
-- amenities: array of free-text tags; the frontend offers a preset
-- checklist of common Nigerian rental amenities plus "other", but nothing
-- constrains the values here — new amenities can be added on the frontend
-- alone, no migration needed.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT '{}';
