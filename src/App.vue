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
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import popper from "cytoscape-popper";

export default {
    name: "app",
    data() {
        return {
            dataSource: []
        };
    },
    mounted() {
        //cytoscape.use(dblclick);
        var self = this;
        var cy = cytoscape({
            container: document.getElementById("cycontainner"),
            style: [
                {
                    selector: "node",
                    style: {
                        label: "data(properties.name)",
                        "font-size": 14,
                        color: "black",
                        "text-valign": "center"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        label: "data(label)",
                        "font-size": 12,
                        color: "gray",
                        "line-color": "#ffaaaa"
                    }
                },
                {
                    selector: "edge.bezier",
                    style: {
                        "curve-style": "bezier",
                        "control-point-step-size": 40,
                        "target-arrow-color": "#ccc",
                        "target-arrow-shape": "triangle"
                    }
                },
                {
                    selector: "edge.unbundled-bezier",
                    style: {
                        "curve-style": "unbundled-bezier",
                        "target-arrow-color": "#ccc",
                        "target-arrow-shape": "triangle",
                        "control-point-distances": 10,
                        "control-point-weights": 0.1
                    }
                },
                {
                    selector: "[label = 'device']",
                    style: {
                        "background-color": "blue"
                    }
                },
                {
                    selector: "[label = 'interface']",
                    style: {
                        "background-color": "pink",
                        width: "20",
                        height: 20
                    }
                }
            ]
        });
        var nodes = [];
        var edges = [];
        var elements = [];
        getGraphData({ script: "MATCH (n) RETURN n LIMIT 1" }).then(function(
            res,
            rec
        ) {
            elements = self.dealDataModel(
                res.result.graph.data.nodes,
                res.result.graph.data.relationships
            );
            cy.add(elements);
            self.autoLayout(cy);
            var layout = cy.layout({ name: "cose" });
            layout.run();
            cy.dblclick();
            cy.nodes().on("dblclick", self.nodeClick.bind(self, cy));
            cy.nodes().on("mouseover", self.mouseover.bind(self, cy));
            cy.nodes().on("mouseout", self.mouseout.bind(self, cy));
        });
        console.log(cy);
    },
    methods: {
        nodeClick(cy, e) {
            var self = this;
            var ele = e.target;
            getRelationshipsAll(ele.data()).then(function(res, rec) {
                // console.log(_elements);
                var nodes = self.dealNodeModel(res.result.graph.data.nodes);
                var relationships = self.dealEdgeModel(
                    res.result.graph.data.relationships
                );
                nodes = self.duplicateNodeRemoval(nodes, cy);
                relationships = self.duplicateEdgeRemoval(relationships, cy);
                console.log(nodes);
                console.log(relationships);
                var _elements;
                _elements = nodes.concat(relationships);
                cy.add(_elements);
                /* 事件不可重复绑定，应该只给新增的node绑定事件 */
                // cy.nodes().on("click", self.nodeClick.bind(self, cy));
                // cy.on("click", '_elements', self.nodeClick.bind(self, cy));
                self.autoLayout(cy);
                var layout = cy.layout({ name: "cose" });
                layout.run();
            });
        },
        mouseover(cy, e) {
            var self = this;
            var a = e.target;
            var popperA = a.popper({
                content: function() {
                    return self.makeDiv(a.data().vid, "Sticky position div");
                }
            });
            popperA.scheduleUpdate();
            /*    var tippyA = self.makeTippy(a, "foo");
            tippyA.show(); */
            //console.log(e.target);
        },
        mouseout(cy, e) {
            var self = this;
            var a = e.target;
            var tooltip = document.getElementById(a.data().vid);
            if (tooltip) {
                tooltip.remove();
            } else {
                console.log("没找到要移除的tooltip");
            }
        },
        makeDiv(id, text) {
            var div = document.createElement("div");
            div.id = id;
            div.classList.add("popper-div");
            div.innerHTML = text;
            document.body.appendChild(div);
            return div;
        },
        makeTippy(node, text) {
            return tippy(node.popperRef(), {
                content: function() {
                    var div = document.createElement("div");

                    div.innerHTML = text;

                    return div;
                },
                trigger: "manual",
                arrow: true,
                placement: "bottom",
                hideOnClick: false,
                multiple: true,
                sticky: true
            });
        },
        dealDataModel(nodes, edges) {
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
        dealNodeModel(nodes) {
            var self = this;
            var _nodes = [];
            var parent = nodes.find(function(item) {
                return item.label === "device";
            });
            nodes.forEach(function(item) {
                if (item.label === "interface") {
                    _nodes.push({
                        group: "nodes",
                        data: {
                            id: item.vid,
                            vid: item.vid,
                            label: item.label,
                            properties: item.properties
                            //parent: parent.vid
                        },
                        position: { x: 0, y: 0 }
                    });
                } else {
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
                }
            });
            return _nodes;
        },
        dealEdgeModel(edges) {
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
                    position: { x: 0, y: 0 },
                    classes: "unbundled-bezier"
                });
            });
            return _edges;
        },
        duplicateNodeRemoval(nodes, cy) {
            var self = this;
            /* var _nodes = cy.$(nodes);
              return cy
                .nodes()
                .difference(_nodes)
                .data(); */
            var _nodes = [];
            nodes.forEach(function(item) {
                for (var i = 0; i < cy.nodes().length; i++) {
                    /* item拿出来和画布中的每一个点比，如果每一个点都不同才push出来 */
                    if (item.data.vid === cy.nodes()[i].data().vid) {
                        break;
                    }
                    if (
                        i === cy.nodes().length - 1 &&
                        item.data.vid !== cy.nodes()[i].data().vid
                    ) {
                        _nodes.push(item);
                        cy.on(
                            "dblclick",
                            "[vid = " + item.data.vid + "]",
                            self.nodeClick.bind(self, cy)
                        );
                        cy.on(
                            "mouseover",
                            "[vid = " + item.data.vid + "]",
                            self.mouseover.bind(self, cy)
                        );
                        cy.on(
                            "mouseout",
                            "[vid = " + item.data.vid + "]",
                            self.mouseout.bind(self, cy)
                        );
                    }
                }
            });

            return _nodes;
        },
        duplicateEdgeRemoval(edges, cy) {
            var self = this;
            /*  var _edges = cy.$(edges);
              return cy
                .edges()
                .difference(_edges)
                .data(); */
            var _edges = [];
            if (cy.edges().length > 0) {
                edges.forEach(function(item, index) {
                    for (var i = 0; i < cy.edges().length; i++) {
                        /* item拿出来和画布中的每一个点比，如果每一个点都不同才push出来 */
                        if (item.data.id === cy.edges()[i].data().id) {
                            break;
                        }
                        if (
                            i === cy.edges().length - 1 &&
                            item.data.id !== cy.edges()[i].data().id
                        ) {
                            _edges.push(item);
                        }
                    }
                });
                return _edges;
            } else {
                return edges;
            }
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
.popper-div {
    /* just an example */
    border: 1px solid red;
    background: #fff;
    z-index: 9999;
    padding: 0.25em;
    pointer-events: none;
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
