import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function to create a deterministic "random" number from the file name
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

serve(async (req) => {
  // This is needed for CORS to work
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json();
    if (!fileName) {
      return new Response(JSON.stringify({ error: 'fileName is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Use a hash of the filename to generate a deterministic "random" score
    const hash = simpleHash(fileName);
    const score = 40 + (hash % 60); // Score between 40 and 99

    let summary = "";
    const issues = [];

    if (score < 60) {
      summary = "The video shows significant signs of tampering. Multiple frame drops were detected, and metadata timestamps do not align with the content. Audio appears to be out of sync in several sections.";
      if (hash % 3 === 0) issues.push({ timestamp: "00:01:15", description: "Potential frame splice detected.", severity: "high" });
      if (hash % 4 === 0) issues.push({ timestamp: "00:02:30", description: "Metadata timestamp mismatch.", severity: "medium" });
      if (hash % 5 === 0) issues.push({ timestamp: "00:02:45", description: "Audio/video desynchronization of 250ms.", severity: "medium" });
      if (hash % 2 === 0) issues.push({ timestamp: "00:03:50", description: "Unusual encoding artifact found.", severity: "low" });
    } else if (score < 85) {
      summary = "The video shows minor inconsistencies that could indicate tampering, but could also be due to compression artifacts. Further manual review is recommended.";
      if (hash % 3 === 0) issues.push({ timestamp: "00:04:10", description: "Minor compression artifacts detected.", severity: "low" });
      if (hash % 4 === 0) issues.push({ timestamp: "00:05:00", description: "Slight audio drift detected.", severity: "medium" });
    } else {
      summary = "The video appears to be authentic. Frame analysis is consistent, metadata is intact, and audio is synchronized.";
    }
    
    // Ensure there's at least one issue for lower scores
    if (score < 85 && issues.length === 0) {
        issues.push({ timestamp: "00:00:10", description: "General integrity check failed.", severity: "low" });
    }

    const report = {
      score,
      summary,
      issues,
    };

    // Simulate processing time to make it feel real
    await new Promise(resolve => setTimeout(resolve, 3000));

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})