<template>
    <div id="app">
        <div id="cycontainner"></div>
        123
    </div>
</template>
<script>
import {
    getGraphData,
    getRelationshipsAll
} from "@/service/search-graph-data.js";
import cytoscape from "cytoscape";
export default {
    name: "app",
    data() {
        return {
            dataSource: []
        };
    },
    mounted() {
        var self = this;
        var cy = cytoscape({
            container: document.getElementById("cycontainner")
            /* elements: [
                // flat array of nodes and edges
                {
                    // node n1
                    group: "nodes",
                    data: {
                        // element data (put json serialisable dev data here)
                        id: "n1", // mandatory (string) id for each element, assigned automatically on undefined
                        parent: "nparent" // indicates the compound node parent id; not defined => no parent
                        // (`parent` can be effectively changed by `eles.move()`)
                    },
                    position: {
                        // the model position of the node (optional on init, mandatory after)
                        x: 100,
                        y: 100
                    }
                },
                {
                    // node n2
                    group: "nodes",
                    data: { id: "n2" },
                    renderedPosition: { x: 200, y: 200 } // can alternatively specify position in rendered on-screen pixels
                },
                {
                    // edge e1
                    data: {
                        id: "e1",
                        source: "n1", // the source node id (edge comes from this node)
                        target: "n2" // the target node id (edge goes to this node)
                    }
                }
            ] */
        });
        /* cy.add({
            group: "nodes",
            data: { weight: 75 },
            position: { x: 200, y: 200 }
        });
        var eles = cy.add([
            {
                group: "nodes",
                data: { id: "n0" },
                position: { x: 100, y: 100 }
            },
            {
                group: "nodes",
                data: { id: "n1" },
                position: { x: 200, y: 200 }
            },
            { group: "edges", data: { id: "e0", source: "n0", target: "n1" } }
        ]); */

        var nodes = [];
        var edges = [];
        var elements = [];
        getGraphData({ script: "MATCH (n) RETURN n LIMIT 1" }).then(function(
            res,
            rec
        ) {
            // or relationships
            elements = self.filterDataModel(
                res.result.graph.data.nodes,
                res.result.graph.data.relationships
            );
            cy.add(elements);
            self.autoLayout(cy);
            var layout = cy.layout({ name: "cose" });
            layout.run();
            cy.nodes().on("click", self.nodeClick.bind(self, cy));
        });
        console.log(cy);
    },
    methods: {
        nodeClick(cy, e) {
            var self = this;
            var ele = e.target;
            getRelationshipsAll(ele.data()).then(function(res, rec) {
                // console.log(_elements);

                var nodes = self.filterNodeModel(res.result.graph.data.nodes);
                var relationships = self.filterEdgeModel(
                    res.result.graph.data.relationships
                );
                nodes = self.duplicateNodeRemoval(nodes, cy);
                relationships = self.duplicateEdgeRemoval(relationships, cy);
                console.log(nodes);
                console.log(relationships);
                var _elements;
                _elements = nodes.concat(relationships);
                cy.add(_elements);

                cy.nodes().on("click", self.nodeClick.bind(self, cy));

                self.autoLayout(cy);
                var layout = cy.layout({ name: "cose" });
                layout.run();
            });
        },
        filterDataModel(nodes, edges) {
            var self = this;
            var _nodes = [];
            nodes.forEach(function(item) {
                _nodes.push({
                    group: "nodes",
                    data: {
                        id: item.vid,
                        vid: item.vid,
                        label: item.label,
                        properties: item.properties
                    },
                    position: { x: 0, y: 0 }
                });
            });
            var _edges = [];
            edges.forEach(function(item, index) {
                _edges.push({
                    group: "edges",
                    data: {
                        id: item.source + "-" + item.destination,
                        label: item.label,
                        source: item.source,
                        target: item.destination,
                        properties: item.properties
                    },
                    position: { x: 0, y: 0 }
                });
            });
            return _nodes.concat(_edges);
        },
        filterNodeModel(nodes) {
            var self = this;
            var _nodes = [];
            nodes.forEach(function(item) {
                _nodes.push({
                    group: "nodes",
                    data: {
                        id: item.vid,
                        vid: item.vid,
                        label: item.label,
                        properties: item.properties
                    },
                    position: { x: 0, y: 0 }
                });
            });
            return _nodes;
        },
        filterEdgeModel(edges) {
            var _edges = [];
            edges.forEach(function(item, index) {
                _edges.push({
                    group: "edges",
                    data: {
                        id: item.source + "-" + item.destination,
                        label: item.label,
                        source: item.source,
                        target: item.destination,
                        properties: item.properties
                    },
                    position: { x: 0, y: 0 }
                });
            });
            return _edges;
        },
        duplicateNodeRemoval(nodes, cy) {
            var self = this;
            var indexs = [];
            nodes.forEach(function(item, index) {
                for (let i = cy.nodes().length - 1; i >= 0; i--) {
                    var data = cy.nodes()[i].data();
                    if (data.vid === item.data.vid) {
                        nodes.splice(index, 1);
                    }
                }
            });
            return nodes;
        },
        duplicateEdgeRemoval(edges, cy) {
            var self = this;
            var indexs = [];
            edges.forEach(function(item, index) {
                if (item) {
                    //var source = parseFloat(item.data.id.split("-")[0]);
                    //var target = parseFloat(item.data.id.split("-")[1]);
                    /* for (var i = 0; i < cy.edges().length; i++) {
                        var data = cy.edges()[i].data();
                        if (data.vid === item.data.vid) {
                            indexs.push(index);
                        }
                    } */
                    for (let i = cy.edges().length - 1; i >= 0; i--) {
                        var data = cy.edges()[i].data();
                        if (data.vid === item.data.vid) {
                            edges.splice(index, 1);
                        }
                    }
                }
            });
            /* 删除以后，数组不变，位置会变成undefined */
            /* indexs.forEach(function(item) {
                delete edges[item];
            }); */
            return edges;
        },
        autoLayout(cy) {
            var layout = cy.layout({ name: "cose" });
            layout.run();
        }
    }
};
</script>
<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
#cycontainner {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
}
#cycontainner canvas {
    left: 0;
    top: 0;
}
#nav {
    padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}
</style>
