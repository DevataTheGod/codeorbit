import React from 'react';
import { Lightbulb, BookOpen, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/dialog'; // Using Dialog components for styling if needed, but let's stick to a custom UI

interface LearningBite {
  keywords: string[];
  title: string;
  content: string;
  resource_url?: string;
}

const LEARNING_BITES: LearningBite[] = [
  {
    keywords: ["auth", "jwt", "login", "signup"],
    title: "Understanding JWT (JSON Web Tokens)",
    content: "JWTs are a stateless way to handle authentication. Instead of storing a session in a database, the server sends a signed token to the client. The client sent this token back in the 'Authorization' header of every request.",
    resource_url: "https://auth0.com/learn/json-web-tokens/"
  },
  {
    keywords: ["database", "schema", "modeling", "entities"],
    title: "Relational Modeling Best Practices",
    content: "When designing your database, follow the 'Normal Forms' to reduce redundancy. Ensure every table has a Primary Key, and use Foreign Keys to create relationships between entities (e.g., a Comment belongs to a Post).",
    resource_url: "https://www.lucidchart.com/pages/database-diagram/database-design"
  },
  {
    keywords: ["api", "rest", "endpoints", "fetch"],
    title: "RESTful API Principles",
    content: "A good REST API uses HTTP methods correctly: GET for reading, POST for creating, PUT/PATCH for updating, and DELETE for removing. Resources should be plural nouns (e.g., /users, /posts).",
    resource_url: "https://restfulapi.net/"
  },
  {
    keywords: ["setup", "foundation", "structure", "repository"],
    title: "Project Architecture: The Folder Structure",
    content: "Keep your code organized by separating concerns. Common folders include: /src/components (UI), /src/hooks (Logic), /src/services (API calls), and /src/utils (Helpers).",
    resource_url: "https://reactjs.org/docs/faq-structure.html"
  }
];

export const getLearningBiteForTask = (taskTitle: string): LearningBite | null => {
  const lowerTask = taskTitle.toLowerCase();
  return LEARNING_BITES.find(bite => 
    bite.keywords.some(keyword => lowerTask.includes(keyword))
  ) || null;
};

export const LearningBiteCard = ({ bite }: { bite: LearningBite }) => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full mt-1">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-primary mb-1">{bite.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {bite.content}
          </p>
          {bite.resource_url && (
            <a 
              href={bite.resource_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <BookOpen className="w-3 h-3" />
              Learn More
              <ExternalLink className="w-2.5 h-2.5 ml-auto" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
