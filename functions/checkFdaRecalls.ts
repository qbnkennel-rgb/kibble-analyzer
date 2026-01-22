import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { foodName } = await req.json();

    if (!foodName) {
      return Response.json({ error: 'Food name required' }, { status: 400 });
    }

    // Fetch current FDA recalls data
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Search the FDA animal recalls website for dog food recalls. Check if "${foodName}" or any similar brand name appears in recent recalls.
      
      Look for:
      - Exact brand name matches
      - Partial matches (e.g., "Blue Buffalo" matches "Blue Buffalo Life Protection")
      - Parent company matches
      
      Return detailed recall information if found.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          has_recall: { type: "boolean" },
          recalls: {
            type: "array",
            items: {
              type: "object",
              properties: {
                brand_name: { type: "string" },
                product_description: { type: "string" },
                recall_date: { type: "string" },
                reason: { type: "string" },
                company: { type: "string" },
                terminated: { type: "boolean" },
                severity: { type: "string" },
                fda_link: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});