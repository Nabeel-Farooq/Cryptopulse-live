// Edge function: AI-powered crypto short-term forecast via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      name,
      symbol,
      currency,
      price,
      change_1h,
      change_24h,
      change_7d,
      high_24h,
      low_24h,
      ath,
      ath_change_percentage,
      market_cap_rank,
    } = body ?? {};

    if (!name || !symbol || price === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Analyze the following live market snapshot and produce a concise short-term outlook.

Asset: ${name} (${String(symbol).toUpperCase()}) — Rank #${market_cap_rank ?? "n/a"}
Quote currency: ${String(currency).toUpperCase()}
Current price: ${price}
Change 1h: ${change_1h ?? "n/a"}%
Change 24h: ${change_24h ?? "n/a"}%
Change 7d: ${change_7d ?? "n/a"}%
24h high: ${high_24h ?? "n/a"}
24h low: ${low_24h ?? "n/a"}
All-time high: ${ath ?? "n/a"}
% from ATH: ${ath_change_percentage ?? "n/a"}%`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a cautious crypto market analyst. You produce short, structured, data-driven short-term outlooks (next 24-72h) based on the metrics provided. Never give financial advice. Always include risks. Be concise and concrete.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_forecast",
              description: "Return a structured short-term forecast",
              parameters: {
                type: "object",
                properties: {
                  outlook: { type: "string", enum: ["bullish", "bearish", "neutral"] },
                  confidence: { type: "number", description: "0-100" },
                  short_term: { type: "string", description: "1-2 sentence outlook for next 24-72h" },
                  key_drivers: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 short bullets",
                  },
                  risks: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 short bullets",
                  },
                  summary: { type: "string", description: "1-2 sentence overall summary" },
                },
                required: ["outlook", "confidence", "short_term", "key_drivers", "risks", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_forecast" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call in response:", JSON.stringify(json));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(argsStr);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-coin error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
