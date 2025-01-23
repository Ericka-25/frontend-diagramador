import React, { useCallback, useContext, useEffect, useState } from 'react';
// Importa la función de exportación que convierte a Spring Boot
import { generateSpringBootEntity } from '../../../src/helpers/exportToSpringBoot';
//'../../helpers/exportToSpringBoot';
import { CollaboratorsList } from '../DiagramPage/CollaboratorsList';
import { useSelector } from 'react-redux'; // Asegúrate de tener esta importación y esto 
import ReactFlow,
{
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import DatabaseNode from './NodeType/DatabaseNode';
import './Styles/text-updater-node.css';
import { MultiSelectionToolbar } from './SelectedNode/MultiSelectionToolbar';
import { SelectedEdge } from './SelectedEdge/SelectedEdge';
import { CopyBoard } from './CopyBoard';
import { Link, useParams } from 'react-router-dom';
import { useFetchProject } from '../../hooks/useFetchProject';
import { updateProject } from '../../helpers/updateProject';
import { SocketContext } from '../../context/SocketContext';



const edgeOptions = {
  label: "1-1..*",
};

//const nodeTypes = useMemo(() => ({database : DatabaseNode,textUpdater: TextUpdaterNode}), []);
const nodeTypes = {
  database: DatabaseNode
};

const connectionLineStyle = { stroke: 'white' };


let nodeId = 0;
const backgroundColors = ['B399FF','6865A5'];

export const Diagram = () => {
  const params = useParams();
  const proyecto = useFetchProject(params.id);

  /* const [nodes, setNodes,onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges,onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]); 
  const defaultEdgeOptions = {
  animated: true,
    style: {
      stroke: 'white',
    },
  };*/

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const reactFlowInstance = useReactFlow();
  const { socket } = useContext(SocketContext);
  const { nombre } = useSelector(state => state.auth);//Esto se aumento

  useEffect(() => {
    const userName = nombre || 'Sin nombre';
    console.log('Uniéndose a la sala con nombre:', userName);
    socket.emit('joinRoom', { room: params.id, name: userName });

    socket.on('newNode', (data) => {
      nodeId = data.nodeId
      setNodes((nds) => nds.concat(data.node));
    })

    socket.on('movedNode', (data) => {
      console.log(`frontend: movedNode ${data.node.data.title}`);
      setNodes(nodes => nodes.map(nd => {
        if (nd.id == data.node.id) {
          nd.position.x = data.node.position.x;
          nd.position.y = data.node.position.y;
        }
        return nd;
      }))
    })

    //* escuchar cuando se actualiza un nodo
    socket.on('updatedNode', (data) => {
      console.log(`frontend: updatedNode ${data.node}`);
      setNodes([...data.node]);
    })

    //* escuchar evento cuando se elimine nodes
    socket.on('deletedNodes', (data) => {
      console.log('frontend: deletedNodes');
      setNodes((nds) => nds.filter(n => {
        for (let i = 0; i < data.length; i++) {
          if (n.id === data[i].id) {
            continue;
          }
          return n;
        }
      }));
    })

    socket.on('newEdge', (data) => {
      console.log('frontend: newEdge');
      setEdges((eds) => addEdge({ ...data.edge, type: 'step', data: { tipo: "Asociacion", label: "1-1..*" }, style: { strokeWidth: 2 } }, eds)),
        [setEdges]
    })



    //* escuchar evento para que se actualice el label de un edge
    socket.on('changeLabel', (data) => {
      console.log('frontend: setLabel');
      setEdges([...data.edges]);
    })

    //* escuchar evento cuando se eliminen edges
    socket.on('deletedEdges', (data) => {
      console.log('frontend: deletedEdges');
      setEdges((edges) => edges.filter(edge => {
        if (edge.id !== data[0].id)
          return edge;
      }));
    })



    return () => {
      socket.emit('leaveRoom', { room: params.id })
    }
  }, [nombre])


  const onConnect = useCallback(
    (connection) => socket.emit('insertEdge', { edge: connection, room: params.id })
  );

  /* const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true,label: 'pues oko' }, eds)),
    [setEdges]
  ); */

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Función para exportar el diagrama como JSON
  const exportDiagram = () => {
    const diagramData = { nodes, edges };  // Captura los nodos y edges actuales
    const json = JSON.stringify(diagramData, null, 2);
    
    // Crear un archivo JSON para descargar
    const element = document.createElement("a");
    const file = new Blob([json], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `diagram_${params.id}.json`;
    document.body.appendChild(element);
    element.click();
  };

  //Para springboot
  const exportDiagramToSpringBoot = () => {
    const diagramData = { nodes, edges };  // Captura los nodos y edges actuales
    const springBootCode = generateSpringBootEntity(diagramData);  // Llama a la función para generar código Spring Boot
    
    // Crear un archivo Java para descargar
    const element = document.createElement("a");
    const file = new Blob([springBootCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SpringBootEntities_${params.id}.java`;  // Descarga como archivo .java
    document.body.appendChild(element);
    element.click();
  };
  

  const handleClickSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      updateProject(proyecto.id, flow);
    }
  }


  const onCreate = useCallback(() => {
    const id = `${++nodeId}`;
    const num = Math.floor(Math.random() * (2 - 0 + 1) + 0);
    const newNode = {
      id,
      type: 'database',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: 'Title',
        atributos: ["id"],
        tipos: ["String"],
        primaryKey: [true],
      },
      style: { backgroundColor: `#${backgroundColors[num]}`, color: 'white' },
    };
    reactFlowInstance.addNodes(newNode);
    socket.emit('insertNode', { node: newNode, room: params.id, nodeId });
  }, []);

  const handleNodeChange = (newElement) => {
    setNodes(newElement);
    socket.emit('updateNode', { node: nodes, room: params.id });
  };

  const handleEdgeChange = (newElement) => {
    setEdges(newElement);
    socket.emit('setLabel', { edges, room: params.id });
  }

  const handleOnEdgesDelete = (eds) => {
    console.log(`se ha eliminado el edge ${eds.length}`);
    socket.emit('deleteEdges', {edges:eds, room: params.id});
  }

  useEffect(() => {
    setNodes(proyecto.diagramObject !== undefined ? proyecto.diagramObject.nodes : []);
    setEdges(proyecto.diagramObject !== undefined ? proyecto.diagramObject.edges : []);
    nodeId = (proyecto.diagramObject !== undefined && proyecto.diagramObject.nodes.length > 0) ? proyecto.diagramObject.nodes[0]['id'] : 0;
  }, [proyecto.diagramObject])

  const handleOnNodesDelete = (nodes) => {
    socket.emit('deleteNodes', { nodes: nodes, room: params.id });
  }

  const handleOnNodeDragStop = (e, node) => {
    socket.emit('moveNode', { node, room: params.id });
  }



  return (
    <div className='h-screen'>
      {/**Cambios */}
      <svg width="0" height="0">
  <defs>
    {/* Agregación (rombo hueco) */}
    <marker
      id="aggregation"
      markerWidth="9"    /* Reducción adicional del tamaño del rombo */
      markerHeight="9"
      refX="8"           /* Ajuste para que el vértice toque el nodo */
      refY="4.5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M 0 4.5 L 4.5 0 L 9 4.5 L 4.5 9 Z" fill="white" stroke="black" />
    </marker>

    {/* Composición (rombo lleno) */}
    <marker
      id="composition"
      markerWidth="9"    /* Reducción adicional del tamaño del rombo */
      markerHeight="9"
      refX="8"           /* Ajuste para que el vértice toque el nodo */
      refY="4.5"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M 0 4.5 L 4.5 0 L 9 4.5 L 4.5 9 Z" fill="black" />
    </marker>
  </defs>
</svg>
{/**Hasta aqui */}
      {
        !proyecto.isEmpty ?
          <ReactFlow
            nodes={nodes}
            edges={edges}
            defaultEdgeOptions={edgeOptions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            //onPaneClick={handlePaneClick}
            onNodesDelete={handleOnNodesDelete}
            onEdgesDelete={handleOnEdgesDelete}
            onNodeDragStop={handleOnNodeDragStop}
            style={{
              backgroundColor: '#F5F5DC',//#2A2A2A
            }}
        
          //defaultEdgeOptions={defaultEdgeOptions}
          //connectionLineStyle={connectionLineStyle}
          >
            <Panel position='top-left'style={{ marginTop: '200px' }}>
             <CollaboratorsList />
             </Panel>
            <Panel position='right'>
              <Link to="/home"><button className='rounded bg-purple-500 p-1 text-white font-bold'>Volver Al Home</button>
              </Link>
              <button className='rounded bg-purple-500 p-1 text-white font-bold mx-2' onClick={onCreate}>New Class</button>
              {/* <button className='rounded bg-white p-1 text-black' >Generar Script</button> */}
              <button className='rounded bg-purple-500 p-1 text-white font-bold mx-2' onClick={handleClickSave}>Guardar Cambios</button>
              <button className='rounded bg-purple-500 p-1 text-white font-bold mx-2' onClick={exportDiagramToSpringBoot}>
                     Exportar como Spring Boot
              </button>

            </Panel>
            <Panel position='bottom-left'>
              <CopyBoard />
            </Panel>
            <MultiSelectionToolbar setNodes={handleNodeChange} />
            <SelectedEdge setEdges={handleEdgeChange} />
          </ReactFlow>
          : <div><h1>Cargando Diagrama {proyecto.id}</h1></div>
      }
    </div>
  );
}

export const DiagramPage = () => {
  return (
    <ReactFlowProvider>
      <Diagram />
    </ReactFlowProvider>
  );
}