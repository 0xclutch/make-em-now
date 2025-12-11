// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Executing account creation...")

// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Basic CORS handling to allow browser-based requests (adjust origins for production)
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // add your production origin here, e.g. 'https://yourdomain.com'
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '3600',
      },
    });
  }

  const supabaseUrl = Deno.env.get('REACT_APP_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('REACT_APP_SUPABASE_KEY') || Deno.env.get('SUPABASE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase function environment variables (REACT_APP_SUPABASE_URL/KEY or SUPABASE_URL/KEY).');
    return new Response(JSON.stringify({ data: null, error: 'Server misconfigured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
      },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, profile } = body || {};


    // ACCOUNT CREATION
    const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if(createErr) {
      console.error('Error creating user:', createErr);
      return new Response(JSON.stringify({ data: null, error: createErr.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowOrigin,
        },
      });
    }
    
    const createdUser = createData?.user || createData;

    let insertResult = null;
    if (profile && createdUser) {
      // Ensure we assign UUID (client uses profile.uuid); avoid using db pk 'id' unless intended
      const profileRow = { ...profile, uuid: createdUser.id };
      // Insert profile data into 'profiles' table
      const { data: profileData, error: profileErr } = await supabaseAdmin
        .from('users')
        .insert([profileRow]);

    
      if (profileErr) {
        console.error('Error inserting profile data:', profileErr);
        return new Response(JSON.stringify({ user: createdUser, insertResult: null, error: profileErr.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowOrigin,
          },
        });
      }
      insertResult = profileData;
    }
    
    return new Response(JSON.stringify({ user: createdUser, insertResult, error: null }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
      },

    });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ data: null, error: String(err) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
      },
    });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
