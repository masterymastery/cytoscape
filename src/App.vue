<template>
  <div id="app">
    <!-- <div id="cycontainner"></div> -->
    <!-- <input ref="inputA" type="index" v-model="inpuValue" /> -->

    <textarea placeholder="例如select * from table" ref="myCodeMirror"></textarea>

    <div class="selectZone">
      <div class="changeColor">
        <div
          v-for="(item,index) in colorList"
          :key="index"
          @click="changeColor(item)"
        >{{item.label}}</div>
      </div>
      <div class="changeLabel">
        <div
          v-for="(item,index) in labelList"
          :key="index"
          @click="changeLabel(item)"
        >{{item.label}}</div>
      </div>
    </div>
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

/* import { codemirror } from "vue-codemirror";
import "codemirror/theme/ambiance.css";
import "codemirror/mode/javascript/javascript"; */

import "codemirror/lib/codemirror.css";
/* import CodeMirror from "codemirror"; */
require("codemirror/mode/cypher/cypher");
const CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/addon/display/placeholder");

export default {
  name: "app",
  /*  components: {
    codemirror
  }, */
  data() {
    return {
      /*       curCode: "123",
      cmOptions: {
        value: "",
        mode: "text/javascript",
        theme: "ambiance",
        readOnly: true
      }, */
      cy: null,
      dataSource: [],
      colorList: [
        { label: "红色", color: "red" },
        { label: "绿色", color: "green" },
        { label: "蓝色", color: "blue" }
      ],
      labelList: [
        { label: "主机名称", value: "name" },
        { label: "IP地址", value: "ip" },
        { label: "所属地区", value: "location" },
        { label: "所属功能区", value: "region" },
        { label: "类型", value: "catalog" }
      ]
    };
  },
  mounted() {
    //cytoscape.use(dblclick);
    var self = this;
    // 定义我们需要高亮的关键字
    const myHighlightList = ["hello", "你好", "$aaa$"];
    this.myCodeMirror = CodeMirror.fromTextArea(this.$refs["myCodeMirror"], {
      lineNumbers: true, // 是否显示行数
      mode: "application/x-cypher-query", // 使用什么模式 text/x-pgsql是sql   javascript等
      showCursorWhenSelecting: true, // 当有选中的时候是否显示光标
      extraKeys: { Ctrl: "autocomplete" }, // 自定义快捷键
      lineWrapping: true
    });

    //var myCodeMirror = codemirror(document.body);
    /* var cy = cytoscape({
      container: document.getElementById("cycontainner"),
      style: [
        {
          selector: "node",
          style: {
            label: "data(properties.name)",
            "font-size": 6,
            color: "black",
            "text-valign": "center"
          }
        },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            width: 1,
            "font-size": 5,
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
    window.cy = cy;
    var nodes = [];
    var edges = [];
    var elements = [];
    getGraphData({ script: "MATCH (n) RETURN n LIMIT 10" }).then(function(
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
    console.log(cy); */
  },
  methods: {
    changeColor(item) {
      window.cy
        .style()
        .selector("node[label = 'device']")
        .style("background-color", item.color)
        .update();
    },
    changeLabel(item) {
      window.cy
        .style()
        .selector("node[label = 'device']")
        .style("label", "data(properties." + item.value + ")")
        .update();
    },
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
      var properties = a.data().properties;
      var status, info;
      if (properties.flag === "normal") {
        status = "正常";
      } else if (properties.flag === "delete") {
        status = "删除";
      } else if (properties.flag === "down") {
        status = "故障";
      }
      if (a.data().label === "interface") {
        info =
          "端口名称：" +
          properties.name +
          "<br>" +
          "端口号：" +
          properties.IP +
          "<br>" +
          "mac地址：" +
          properties.mac +
          "<br>" +
          "流量：" +
          properties.bw +
          "<br>" +
          "工作状态：" +
          status;
      } else {
        info =
          "主机名称：" +
          properties.name +
          "<br>" +
          "IP地址：" +
          properties.ip +
          "<br>" +
          "所属地区：" +
          properties.location +
          "<br>" +
          "所属功能区：" +
          properties.region +
          "<br>" +
          "类型：" +
          properties.catalog +
          "<br>" +
          "工作状态：" +
          status;
      }

      var popperA = a.popper({
        content: function() {
          return self.makeDiv(a.data().vid, info);
        }
      });
      popperA.scheduleUpdate();
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
.selectZone {
  width: 100%;
  height: 50px;
  position: absolute;
  display: flex;
  bottom: 0;
}
.changeColor {
  display: flex;
  width: 300px;
  margin: 10px;
}
.changeColor div {
  flex-flow: row;
  margin: 10px;
  cursor: pointer;
}
.changeLabel {
  display: flex;
  margin: 10px;
}
.changeLabel div {
  flex-flow: row;
  margin: 10px;
  cursor: pointer;
}
#cycontainner {
  width: 100%;
  height: calc(100% - 50px);
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
