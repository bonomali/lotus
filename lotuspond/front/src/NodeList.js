import React from 'react';
import FullNode from "./FullNode";
import ConnMgr from "./ConnMgr";
import Consensus from "./Consensus";

class NodeList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      existingLoaded: false,
      nodes: {},

      showConnMgr: false,
      showConsensus: false,

      windows: {},
      nextWindow: 0,
    }

    // This binding is necessary to make `this` work in the callback
    this.spawnNode = this.spawnNode.bind(this)
    this.connMgr = this.connMgr.bind(this)
    this.consensus = this.consensus.bind(this)
    this.mountWindow = this.mountWindow.bind(this)

    this.getNodes()
  }

  async getNodes() {
    const nds = await this.props.client.call('Pond.Nodes')
    const nodes = nds.reduce((o, i) => {o[i.ID] = i; return o}, {})
    console.log('nds', nodes)
    this.setState({existingLoaded: true, nodes: nodes})
  }

  async spawnNode() {
    const node = await this.props.client.call('Pond.Spawn')
    console.log(node)
    this.setState(state => ({nodes: {...state.nodes, [node.ID]: node}}))
  }

  connMgr() {
    this.setState({showConnMgr: true})
  }

  consensus() {
    this.setState({showConsensus: true})
  }

  mountWindow(cb) {
    const id = this.state.nextWindow
    this.setState({nextWindow: id + 1})

    const window = cb(() => {
      console.log("umount wnd todo")
    })

    this.setState(prev => ({windows: {...prev.windows, [id]: window}}))
  }

  render() {
    let connMgr
    if (this.state.showConnMgr) {
      connMgr = (<ConnMgr nodes={this.state.nodes}/>)
    }

    let consensus
    if (this.state.showConsensus) {
      consensus = (<Consensus nodes={this.state.nodes} mountWindow={this.mountWindow}/>)
    }

    return (
      <div>
        <div>
          <button onClick={this.spawnNode} disabled={!this.state.existingLoaded}>Spawn Node</button>
          <button onClick={this.connMgr} disabled={!this.state.existingLoaded && !this.state.showConnMgr}>Connections</button>
          <button onClick={this.consensus} disabled={!this.state.existingLoaded && !this.state.showConsensus}>Consensus</button>
        </div>
        <div>
          {
            Object.keys(this.state.nodes).map(n => {
              const node = this.state.nodes[n]

              return (<FullNode key={node.ID}
                                node={{...node}}
                                pondClient={this.props.client}
                                onConnect={(conn, id) => this.setState(prev => ({nodes: {...prev.nodes, [n]: {...node, conn: conn, peerid: id}}}))}
                                mountWindow={this.mountWindow}/>)
            })
          }
          {connMgr}
          {consensus}
        </div>
        <div>
          {Object.keys(this.state.windows).map((w, i) => <div key={i}>{this.state.windows[w]}</div>)}
        </div>
      </div>
    );
  }
}

export default NodeList