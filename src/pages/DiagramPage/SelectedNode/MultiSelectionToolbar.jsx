import { useEffect, useState } from 'react';
import { Panel, useStore } from 'reactflow';
import { InputsAtributes } from './InputsAtributes';

const selectedNodesSelector = (state) =>
  Array.from(state.nodeInternals.values())
    .filter((node) => node.selected)
    .map((node) => ({ id: node.id, data: node.data }));

export const MultiSelectionToolbar = ({ setNodes }) => {
  const selectedNode = useStore(selectedNodesSelector);
  const selectedNodeIds = selectedNode.map((node) => node.id);
  const selectedNodeLabel = selectedNode.map((node) => node.data.label)[0];

  const [titulo, setTitulo] = useState("");
  const [atributos, setAtributos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [primaryKey, setPrimaryKey] = useState([]);

  useEffect(() => {
    if (selectedNode.length > 0) {
      setTitulo(selectedNodeLabel);
      setAtributos(selectedNode.map((node) => node.data.atributos)[0]);
      setTipos(selectedNode.map((node) => node.data.tipos)[0]);
      setPrimaryKey(selectedNode.map((node) => node.data.primaryKey)[0]);
    }
  }, [selectedNode]);

  const onInputChange = (event) => {
    setTitulo(event.target.value);
  };

  const handleChangeNodes = () => {
    setNodes((nodes) =>
      nodes.map((nd) => {
        if (nd.id == selectedNodeIds) {
          nd.data.label = titulo;
          nd.data.atributos = [...atributos];
          nd.data.tipos = [...tipos];
          nd.data.primaryKey = [...primaryKey];
          nd.selected = false;
        }
        return nd;
      })
    );
  };

  const addAtributo = () => {
    const n = atributos.length;
    const newAtributo = [...atributos, `new${n}`];
    setAtributos(newAtributo);
    const newTipo = [...tipos, 'String'];
    setTipos(newTipo);
    const newPK = [...primaryKey, false];
    setPrimaryKey(newPK);
  };

  const deleteAtributo = (pos) => {
    const delAtri = [...atributos];
    delAtri.splice(pos, 1);
    const delTipo = [...tipos];
    delTipo.splice(pos, 1);
    const delPK = [...primaryKey];
    delPK.splice(pos, 1);
    setAtributos(delAtri);
    setTipos(delTipo);
    setPrimaryKey(delPK);
  };

  const handleChangeAtributo = (index, newAtributo) => {
    const array = [...atributos];
    array[index] = newAtributo;
    setAtributos([...array]);
  };

  const handleChangeTipo = (index, newTipo) => {
    const array = [...tipos];
    array[index] = newTipo;
    setTipos([...array]);
  };

  const handleChangePK = (index) => {
    const array = [...primaryKey];
    array[index] = !array[index];
    setPrimaryKey([...array]);
  };

  return (
    <Panel position="top-left">
      {/* Añadir un borde y padding al contenedor del menú */}
      <div className='grid grid-rows-3 gap-1 text-center text-black border border-white rounded p-6 bg-gray-500' >
        <h2 className="text-white">NodeID: {selectedNodeIds}</h2>
        <input
          type="text"
          name="titulo"
          value={titulo}
          onChange={onInputChange}
          className='px-2 bg-[#FFFA] rounded border border-gray-600'
        />
        <button className='bg-purple-500 rounded' onClick={addAtributo}>
          AddAtributo
        </button>
        {atributos.map((atributo, index) => (
          <InputsAtributes
            key={index}
            index={index}
            atributo={atributo}
            deleteAtributo={deleteAtributo}
            tipos={tipos[index]}
            primaryKey={primaryKey[index]}
            changeAtributo={handleChangeAtributo}
            changeTipo={handleChangeTipo}
            changePK={handleChangePK}
          />
        ))}
       <button onClick={handleChangeNodes} className='bg-purple-700 rounded h-8 text-white font-bold'>
  Guardar
</button>

      </div>
    </Panel>
  );
};
