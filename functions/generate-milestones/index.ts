import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a project planning expert for the AMIT-BODHIT co-building platform. Your task is to analyze a student's project and create a structured learning roadmap with milestones and tasks.

GUIDELINES:
1. Create a dynamic number of milestones (typically 4-8) based on project complexity
2. Each milestone should have 3-6 concrete tasks
3. Tasks should be specific, actionable, and educational
4. Consider the student's skill score when determining complexity
5. Align milestones with the project deadline
6. Focus on building real skills, not just completing the project
7. Include learning objectives in milestone descriptions

MILESTONE STRUCTURE:
- Start with project setup and foundation
- Progress through core features and integrations
- Include testing, security, and documentation
- End with deployment and final polish

TASK GUIDELINES:
- Each task should take 1-4 hours
- Include clear acceptance criteria in description
- Balance coding tasks with learning tasks
- Consider dependencies between tasks`;

type RoadmapTask = {
  title: string;
  description: string;
  order_index: number;
};

type RoadmapMilestone = {
  title: string;
  description: string;
  order_index: number;
  tasks: RoadmapTask[];
};

type Roadmap = {
  milestones: RoadmapMilestone[];
};

function buildFallbackRoadmap(submission: any): Roadmap {
  const title = submission?.project_title || "Project";
  const tech = Array.isArray(submission?.tech_stack) ? submission.tech_stack.join(", ") : "selected stack";
  const skill = Number(submission?.skill_score || 0);
  const level = skill <= 5 ? "Beginner" : skill <= 10 ? "Intermediate" : "Advanced";

  return {
    milestones: [
      {
        order_index: 0,
        title: "Project Setup & Foundations",
        description: `Set up repository, environment, and coding standards for ${title}. Skill level: ${level}.`,
        tasks: [
          { order_index: 0, title: "Initialize repository and structure", description: "Create base folders and README with scope and assumptions." },
          { order_index: 1, title: "Configure development environment", description: `Set up tooling for ${tech} and verify local run/build flow.` },
          { order_index: 2, title: "Define implementation roadmap", description: "Confirm features, priorities, and learning goals." },
        ],
      },
      {
        order_index: 1,
        title: "Core Architecture & Data",
        description: "Implement data model, schema validation, and core platform behavior.",
        tasks: [
          { order_index: 0, title: "Design data entities and relations", description: "Document key entities and data flow for main features." },
          { order_index: 1, title: "Build core service/API layer", description: "Implement foundation create/read/update/delete operations." },
          { order_index: 2, title: "Add data validation & error handling", description: "Protect core logic from invalid inputs and edge cases." },
        ],
      },
      {
        order_index: 2,
        title: "Primary Feature Development",
        description: "Build and integrate primary user-facing features.",
        tasks: [
          { order_index: 0, title: "Develop main user-flow", description: "Deliver the end-to-end flow for the most important use case." },
          { order_index: 1, title: "Frontend-Backend Integration", description: "Wire up UI components to the underlying logic/services." },
          { order_index: 2, title: "Security and Permission implementation", description: "Restrict access and protect user data." },
        ],
      },
      {
        order_index: 3,
        title: "Testing, Optimization & Deployment",
        description: "Prepare the project for submission and final delivery.",
        tasks: [
          { order_index: 0, title: "Complete system testing", description: "Verify all features work together as expected." },
          { order_index: 1, title: "Performance polish and bug fixes", description: "Optimize bottlenecks and resolve high-priority visual/logic issues." },
          { order_index: 2, title: "Final deployment and documentation", description: "Publish project and provide setup/usage guides." },
        ],
      },
    ],
  };
}

async function getRoadmapFromAI(lovableApiKey: string, submission: any): Promise<Roadmap | null> {
  const userPrompt = `Generate a project roadmap for the following student project:

PROJECT TITLE: ${submission.project_title}

PROJECT DESCRIPTION:
${submission.project_description}

TECH STACK: ${submission.tech_stack.join(", ")}

DEADLINE: ${submission.deadline}

STUDENT SKILL SCORE: ${submission.skill_score}/15 (${submission.skill_score <= 5 ? "Beginner" : submission.skill_score <= 10 ? "Intermediate" : "Advanced"})

Create a structured learning roadmap with milestones and tasks that will help this student build real skills while completing their project.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_project_roadmap",
            description: "Create a structured project roadmap with milestones and tasks",
            parameters: {
              type: "object",
              properties: {
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Clear, concise milestone title" },
                      description: { type: "string", description: "What the student will learn/accomplish" },
                      order_index: { type: "number", description: "Order of this milestone (0-based)" },
                      tasks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string", description: "Specific, actionable task title" },
                            description: { type: "string", description: "What to do and acceptance criteria" },
                            order_index: { type: "number", description: "Order within the milestone (0-based)" },
                          },
                          required: ["title", "description", "order_index"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["title", "description", "order_index", "tasks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["milestones"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "create_project_roadmap" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    return null;
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "create_project_roadmap") {
    console.error("Unexpected AI response format:", aiResponse);
    return null;
  }

  try {
    const roadmap = JSON.parse(toolCall.function.arguments) as Roadmap;
    if (!roadmap?.milestones?.length) return null;
    return roadmap;
  } catch (e) {
    console.error("Failed parsing AI roadmap:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();

    if (!submissionId) {
      return new Response(JSON.stringify({ error: "submissionId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: submission, error: fetchError } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      console.error("Failed to fetch submission:", fetchError);
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating milestones for:", submission.project_title);

    const aiRoadmap = LOVABLE_API_KEY ? await getRoadmapFromAI(LOVABLE_API_KEY, submission) : null;
    const roadmap = aiRoadmap || buildFallbackRoadmap(submission);
    const mode = aiRoadmap ? "ai" : "fallback";
    console.log(`Generated roadmap in ${mode} mode with ${roadmap.milestones.length} milestones`);

    // Handle deadline - parse it properly
    let deadlineDate: Date;
    if (!submission.deadline) {
      // Default to 30 days from now if no deadline
      deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 30);
    } else {
      // Parse the deadline - it might be in YYYY-MM-DD format
      deadlineDate = new Date(submission.deadline + "T00:00:00");
      // If invalid, default to 30 days
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30);
      }
    }

    const now = new Date();
    const totalDays = Math.max(1, Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const daysPerMilestone = Math.max(1, Math.floor(totalDays / roadmap.milestones.length));

    const createdMilestones = [];

    for (const milestone of roadmap.milestones) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + daysPerMilestone * (milestone.order_index + 1));

      // Format date as YYYY-MM-DD explicitly
      const dueDateStr = dueDate.getFullYear() + "-" + 
        String(dueDate.getMonth() + 1).padStart(2, "0") + "-" + 
        String(dueDate.getDate()).padStart(2, "0");

      const { data: createdMilestone, error: milestoneError } = await supabase
        .from("milestones")
        .insert({
          submission_id: submissionId,
          title: milestone.title,
          description: milestone.description,
          order_index: milestone.order_index,
          due_date: dueDateStr,
          source: "ai",
          status: "pending",
        })
        .select()
        .single();

      if (milestoneError) {
        console.error("Failed to create milestone:", milestoneError);
        continue;
      }

      const tasksToInsert = milestone.tasks.map((task: RoadmapTask) => ({
        milestone_id: createdMilestone.id,
        title: task.title,
        description: task.description,
        order_index: task.order_index,
        status: "pending",
        progress: 0,
      }));

      const { error: tasksError } = await supabase.from("tasks").insert(tasksToInsert);
      if (tasksError) {
        console.error("Failed to create tasks:", tasksError);
      }

      createdMilestones.push({
        ...createdMilestone,
        tasks: milestone.tasks,
      });
    }

    await supabase
      .from("project_submissions")
      .update({ status: "in_progress" })
      .eq("id", submissionId);

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        milestonesCreated: createdMilestones.length,
        milestones: createdMilestones,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Generate milestones error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
