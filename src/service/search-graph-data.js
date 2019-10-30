import http from "../core/http";

function getHeaders() {
    return {
        headers: {
            Authorization: "Bearer " + localStorage.bearer
        }
    };
}

function getCypher(params) {
    let headers = getHeaders();
    return http.post("/db/cypher", params, headers);
}

function getIndexes() {
    let headers = getHeaders();
    return http.get("/db/index", {}, headers);
}

function getSubGraph(nodeIds) {
    let headers = getHeaders();
    if (nodeIds.length > 0) {
        return http.post(
            "/db/misc/sub_graph",
            {
                vertex_ids: nodeIds
            },
            headers
        );
    } else {
        return new Promise((res, rej) => {
            res({
                nodes: [],
                relationships: []
            });
        });
    }
}

export function getGraphData(params) {
    return new Promise((resolve, reject) => {
        getCypher(params).then(res => {
            let nodeIds = [];
            let result = res.data.result;
            let vidIndex = [];
            let headers = res.data.header;
            try {
                headers.forEach((item, index) => {
                    if (item.type === 1) {
                        vidIndex.push(index);
                    }
                });
                result.forEach(item => {
                    vidIndex.forEach(c => {
                        if (item && item[c]) {
                            let vid = item[c].replace(
                                /(V\[)([0-9]*)(])/g,
                                ($1, $2, $3) => {
                                    return $3;
                                }
                            );
                            nodeIds.push(parseInt(vid));
                        }
                    });
                });
                Promise.all([getIndexes(), getSubGraph(nodeIds)])
                    .then(res => {
                        resolve({
                            status: 1,
                            msg: "getGraphData success",
                            result: {
                                indexes: res[0],
                                graph: res[1],
                                result: result,
                                headers: headers
                            }
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });
            } catch (error) {
                console.error(error);
            }
        });
    });
}
/**
 *
 * @param {vid:''} param
 */
export function getRelationshipsAll(param) {
    let headers = getHeaders();
    let url = `/db/node/${param.vid}/relationships/all`;
    return new Promise((resolve, reject) => {
        http.get(url, {}, headers).then(result => {
            let nodeIds = [param.vid];
            result.data.outgoing_relationships.forEach(item => {
                if (item) {
                    nodeIds.push(item.destination);
                }
            });
            result.data.incoming_relationships.forEach(item => {
                if (item) {
                    nodeIds.push(item.source);
                }
            });
            nodeIds = [...new Set(nodeIds)];
            Promise.all([getIndexes(), getSubGraph(nodeIds)])
                .then(res => {
                    resolve({
                        status: 1,
                        msg: "getGraphData success",
                        result: {
                            indexes: res[0],
                            graph: res[1]
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
}
