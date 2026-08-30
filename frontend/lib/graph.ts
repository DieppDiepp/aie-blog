import type { Post } from "@/lib/types";
import { TOPICS } from "@/lib/topics";

// The knowledge graph is derived, never authored: topics are hubs, each post is
// a node wired to every topic its tags belong to. Topics with no posts still
// appear as lonely nodes, so the graph doubles as a map of where the writing is
// headed. As tags accumulate, shared hubs connect posts without any extra work.
export type GraphNode = {
  id: string;
  kind: "topic" | "post";
  label: string;
  href: string;
  degree: number;
};
export type GraphEdge = { source: string; target: string };
export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] };

export function buildGraph(posts: Post[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const degree = new Map<string, number>();
  const bump = (id: string) => degree.set(id, (degree.get(id) ?? 0) + 1);

  for (const topic of TOPICS) {
    nodes.push({
      id: `topic:${topic.slug}`,
      kind: "topic",
      label: topic.name,
      href: `/topics/${topic.slug}`,
      degree: 0,
    });
  }

  for (const post of posts) {
    const id = `post:${post.slug}`;
    nodes.push({
      id,
      kind: "post",
      label: post.title,
      href: `/blog/${post.slug}`,
      degree: 0,
    });
    let matched = 0;
    for (const topic of TOPICS) {
      if (post.tags?.some((tag) => topic.labels.includes(tag.label))) {
        const tid = `topic:${topic.slug}`;
        edges.push({ source: id, target: tid });
        bump(id);
        bump(tid);
        matched++;
      }
    }
    // Anything that doesn't fit an existing field lands in "Other" so no post is
    // ever an orphan on the graph.
    if (matched === 0) {
      const tid = "topic:other";
      edges.push({ source: id, target: tid });
      bump(id);
      bump(tid);
    }
  }

  for (const node of nodes) node.degree = degree.get(node.id) ?? 0;
  return { nodes, edges };
}
