from typing import List, Dict
from collections import defaultdict
from datetime import datetime

class AssetFlowTracer:
    def __init__(self):
        self.graph = defaultdict(list)

    def ingest_transfers(self, transfers: List[Dict]):
        """
        transfers: list of dicts like { 'from': str, 'to': str, 'amount': float, 'timestamp': int }
        """
        for tx in transfers:
            edge = {
                "to": tx["to"],
                "amount": tx["amount"],
                "timestamp": tx["timestamp"]
            }
            self.graph[tx["from"]].append(edge)

    def get_flow_from(self, wallet: str, depth: int = 2) -> List[Dict]:
        path = []
        visited = set()

        def dfs(addr: str, current_depth: int):
            if current_depth > depth or addr in visited:
                return
            visited.add(addr)
            for edge in self.graph.get(addr, []):
                path.append({
                    "from": addr,
                    "to": edge["to"],
                    "amount": edge["amount"],
                    "time": datetime.fromtimestamp(edge["timestamp"]).isoformat()
                })
                dfs(edge["to"], current_depth + 1)

        dfs(wallet, 0)
        return path
