import React, { useEffect, useState } from 'react'
import { MarkerType, Panel, useReactFlow, useStore } from 'reactflow';
import { OptionsEdges } from './OptionsEdges';
import { TypeEdge } from './TypeEdge';




const selectedEdgesSelector = (state) =>
    Array.from(state.edges)
        .filter((edge) => edge.selected)
        .map((edge) => ({ id: edge.id, label: edge.data.label, source: edge.source, target: edge.target, tipo: edge.data.tipo }));

export const SelectedEdge = ({ setEdges }) => {
    const selectedEdge = useStore(selectedEdgesSelector);
    const { getNodes,setNodes } = useReactFlow();//Aqui aumente el setNodes para la clase intermedia
    const selectedEdgeIds = selectedEdge.map((edge) => edge.id);

    const source = getNodes().filter((edge) => edge.id == selectedEdge.map((edge) => edge.source)[0]).map((node) => node.data.label);
    const target = getNodes().filter((edge) => edge.id == selectedEdge.map((edge) => edge.target)[0]).map((node) => node.data.label);

    //const selectedEdgeId = selectedEdge.map((edge) => edge.id);
    const [edge, setEdge] = useState();
    const [type,setType] = useState();
    const isVisible = selectedEdge.length > 0;

    useEffect(() => {
        setType(selectedEdge.map((edge) => edge.tipo));
        //setType(selectedEdge.map((edge) => edge.tipo[0]));
        if (selectedEdge.map((edge) => edge.tipo).includes("Asociacion")) {
            setEdge(selectedEdge.map((edge) => edge.label.split("-"))[0]);
        }
        //console.log(getEdges());
    }, [selectedEdge])



    const handleEdgeChange = () => {
        setEdges(edges => edges.map(ed => {
            if (ed.id == selectedEdgeIds) {
                ed.animated = false;
                ed.markerEnd = {};
                if (type.includes("Asociacion-Class")) {  // Detectar Asociacion-Class aquí
                    createIntermediateNode(source, target);  // Llamada para crear el nodo intermedio
                }else 
                if (type.includes("Asociacion")) {
                    const newEdge = edge[0] + "-" + edge[1];
                    ed.label = newEdge;
                    ed.data.label = newEdge;
                    ed.style = {
                        strokeWidth: 2,
                    }
                }
                   
                
                else if (type.includes("Herencia")) {
                    ed.label = "Herencia";
                    ed.markerEnd = {
                        type: MarkerType.ArrowClosed,
                        width: 15,
                        height: 15,
                        color: '#000000',
                    };
                    ed.style = {
                        strokeWidth: 2,
                        stroke: '#000000',
                    };
                }
                else if (type.includes("Agregacion")) {
                    ed.label = "Agregacion";
                   /* ed.markerEnd = {
                        type: MarkerType.Arrow,
                        width: 15,
                        height: 15,
                        color: '#FFFFFF'
                    };*/
                    ed.markerEnd = 'aggregation';
                    ed.style = {
                        strokeWidth: 2,
                        stroke: '#FFFFFF',
                    };
                }
                else if (type.includes("Composicion")) {
                    ed.label = "Composicion";
                   /* ed.markerEnd = {
                        type: MarkerType.Arrow, width: 15,
                        height: 15,
                        color: '#000000'
                    };*/
                    ed.markerEnd = 'composition';
                    ed.style = {
                        strokeWidth: 2,
                        stroke: '#000000',
                    };
                }
                else if (type.includes("Dependencia")) {
                    ed.label = "Dependencia";
                    ed.animated = true;
                    ed.markerEnd = { type: MarkerType.Arrow };
                    ed.style = {
                        strokeWidth: 2,
                    };
                }
                ed.data.tipo = type;
                ed.selected = false;
            }
            return ed;
        }))
    }

    const handleOptionChange = (index, newEdge) => {
        const newArray = [...edge];
        newArray[index] = newEdge;
        setEdge([...newArray]);
    };

    const handleTypeChange = (elem)=>{
        setType(elem);
    }

    //Clase intermedia
   // Crear nodo intermedio y conexiones
const createIntermediateNode = (source, target) => {
     // Validar si source o target no están definidos
     if (!source || !target) {
        console.error('El nodo source o target no está definido.');
        return;  // Detener la ejecución si no están definidos
    }
    const newNode = {
        id: `node_${source}_${target}`, // ID único
        data: {
            label: `TablaIntermedia_${source}_${target}`, // Etiqueta del nodo intermedio
            atributos: ['id'], // Atributos del nodo intermedio
            tipos: ['Text'], // Tipos de datos
            primaryKey: [true], // Llave primaria
        },
        position: { x: 300, y: 300 }, // Ajusta la posición
        type: 'default',
    };

    // Agregar nodo intermedio
    setNodes((nodes) => [...nodes, newNode]);

    // Crear las conexiones entre source, target y la clase intermedia
    setEdges((edges) => [
        ...edges,
        {
            id: `edge_${source}_${newNode.id}`, // Relación entre source y nodo intermedio
            source: source,
            target: newNode.id,
            animated: false,
            label: "Asociacion-Class",
            type: "default", // Usa el tipo de conexión "straight"
            style: { strokeDasharray: "5,5" }, // Línea punteada
            markerEnd: {
                type: MarkerType.Arrow, // Flecha cerrada
                color: '#000',
            },
        },
        {
            id: `edge_${newNode.id}_${target}`, // Relación entre nodo intermedio y target
            source: newNode.id,
            target: target,
            animated: false,
            label: "Asociacion-Class",
            type: "default", // Usa el tipo de conexión "straight"
            style: { strokeDasharray: "5,5" }, // Línea punteada
            markerEnd: {
                type: MarkerType.Arrow, // Flecha cerrada
                color: '#000',
            },
        }
    ]);
};

      
    /////

    return (
        <>
            {isVisible &&
                <Panel position="top-left" style={{ marginTop: '300px' }}>
                    {edge != undefined &&
                        <div className='text-center text-white'>
                            <div className="grid grid-cols-2 grap-2 my-2">
                            <div className="text-black">Tipo Relacion:</div> 
                                <TypeEdge type={type} change={handleTypeChange} />
                            </div>
                            {type.includes("Asociacion") &&
                                <div className='grid grid-cols-2 grap-2'>
                                    <div className=''>
                                        {source}
                                    </div>
                                    <div className=''>
                                        {target}
                                    </div>
                                    {
                                        edge.map((ed, index) => (
                                            <OptionsEdges key={index} index={index} ed={ed} changeOption={handleOptionChange} />
                                        ))
                                    }
                                </div>
                            }
                            <button className='bg-purple-700 rounded my-1 px-1 w-full col-span-2' onClick={handleEdgeChange}>
                                Guardar
                            </button>
                        </div>
                    }
                </Panel>
            }
        </>
    )
}
