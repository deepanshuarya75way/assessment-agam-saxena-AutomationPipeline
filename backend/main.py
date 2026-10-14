from collections import deque
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# =========================================================
# Application
# =========================================================

app = FastAPI(
    title="VectorShift Pipeline API",
    description="Backend API for the VectorShift pipeline builder",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
    allow_headers=[
        "Content-Type",
        "Accept",
    ],
)


# =========================================================
# Request Models
# =========================================================

class PipelinePayload(BaseModel):
    nodes: list[dict[str, Any]] = Field(
        default_factory=list,
        max_length=500,
    )

    edges: list[dict[str, Any]] = Field(
        default_factory=list,
        max_length=1000,
    )


# =========================================================
# DAG Detection
# =========================================================

def is_dag(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> bool:
    """
    Determine whether the supplied pipeline is a DAG.

    Uses Kahn's topological sorting algorithm.

    Returns:
        True  -> valid directed acyclic graph
        False -> invalid graph or cycle detected
    """

    # -----------------------------------------------------
    # Extract node IDs
    # -----------------------------------------------------

    node_ids = []

    for node in nodes:
        node_id = node.get("id")

        if node_id is None:
            return False

        node_id = str(node_id).strip()

        if not node_id:
            return False

        node_ids.append(node_id)

    # -----------------------------------------------------
    # No nodes
    # -----------------------------------------------------

    if not node_ids:
        return True

    # -----------------------------------------------------
    # Duplicate node IDs
    # -----------------------------------------------------

    if len(node_ids) != len(set(node_ids)):
        return False

    node_id_set = set(node_ids)

    # -----------------------------------------------------
    # Build graph
    # -----------------------------------------------------

    graph: dict[str, list[str]] = {
        node_id: []
        for node_id in node_ids
    }

    indegree: dict[str, int] = {
        node_id: 0
        for node_id in node_ids
    }

    # Used to detect duplicate edges.
    seen_edges: set[tuple[str, str]] = set()

    # -----------------------------------------------------
    # Process edges
    # -----------------------------------------------------

    for edge in edges:

        source = edge.get("source")
        target = edge.get("target")

        # Missing source/target.
        if source is None or target is None:
            return False

        source = str(source).strip()
        target = str(target).strip()

        # Empty IDs.
        if not source or not target:
            return False

        # Source/target must exist.
        if (
            source not in node_id_set
            or target not in node_id_set
        ):
            return False

        # Explicit self-loop detection.
        if source == target:
            return False

        edge_pair = (source, target)

        # Duplicate edge.
        if edge_pair in seen_edges:
            return False

        seen_edges.add(edge_pair)

        graph[source].append(target)
        indegree[target] += 1

    # -----------------------------------------------------
    # Kahn's topological sort
    # -----------------------------------------------------

    queue = deque(
        node_id
        for node_id, degree in indegree.items()
        if degree == 0
    )

    processed_nodes = 0

    while queue:

        current = queue.popleft()

        processed_nodes += 1

        for neighbor in graph[current]:

            indegree[neighbor] -= 1

            if indegree[neighbor] == 0:
                queue.append(neighbor)

    # -----------------------------------------------------
    # DAG condition
    # -----------------------------------------------------

    return processed_nodes == len(node_ids)


# =========================================================
# Routes
# =========================================================

@app.get("/")
def root():
    return {
        "message": "VectorShift Pipeline API is running",
        "status": "healthy",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }


@app.post("/pipelines/parse")
def parse_pipeline(
    payload: PipelinePayload,
):
    """
    Analyze a pipeline.

    Returns:
        num_nodes
        num_edges
        is_dag
    """

    nodes = payload.nodes
    edges = payload.edges

    return {
        "num_nodes": len(nodes),
        "num_edges": len(edges),
        "is_dag": is_dag(
            nodes,
            edges,
        ),
    }