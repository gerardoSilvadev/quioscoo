import axios from "axios";
import { useState,useEffect,createContext } from "react";
import { toast } from 'react-toastify'
import { useRouter } from "next/router";

const QuioscoContext = createContext()

const QuioscoProvider = ({children}) => {
    const [categorias, setCategorias] = useState([])
    const [categoriaActual, setCategoriaActual] = useState({})
    const [producto, setProducto] = useState({})
    const [modal, setModal ] = useState(false)
    const [pedido, setPedido] = useState([])
    const [nombre, setNombre] = useState('')
    const [total, setTotal] = useState(0)
    
    
    const router = useRouter()


    const obtenerCategorias = async () => {
        const { data } = await axios('/api/categorias')
        setCategorias(data)
    }

    useEffect(() => {
        obtenerCategorias()
    },[])

    useEffect(() => { 
        setCategoriaActual(categorias[0])
    },[categorias])

    useEffect(() => {
        const nuevoTotal = pedido.reduce((total,producto) => (producto.precio * producto.cantidad) + total, 0)
        setTotal(nuevoTotal)
    }, [pedido])

    const handleClickCategoria = id => {
        const categoria = categorias.filter(cat => cat.id === id)
        setCategoriaActual(categoria[0])
        router.push("/")
    }

    const handleSetProducto = producto => {
       setProducto(producto)
    }

    const handleChangeModal = () => {
        setModal(!modal)
    }

    const handleEditarCantidades = id => {
        const productoActualizar = pedido.filter(producto => producto.id === id)
        setProducto(productoActualizar[0])
        setModal(!modal)
    }

    const handleEliminarProducto = id => {
        const pedidoActualizado = pedido.filter(producto => producto.id !== id)
        setPedido(pedidoActualizado)
    }
    
    const colocarOrden = async e => {
        e.preventDefault()

        try {
            await axios.post("api/ordenes", {pedido, nombre,total, fecha: Date.now().toString()})
            
            //Resetear la app
            setCategoriaActual(categorias[0])
            setPedido([])
            setNombre('')
            setTotal(0)

            toast.success('Pedido Realizado Correctamente')

            setTimeout(() => {
                router.push('/')
            }, 3000)

        } catch (error) {
            console.log(error)
        }


    }

    
    //en esta funcion eliminamos categoriaId e imagen al añadir el procucto ya que no lo necesitamos
    const handleAgregarPedido = ({categoriaId, ...producto}) => {
        if(pedido.some(productoState => productoState.id === producto.id)) {
            //Actualizar la cantidad 
             const pedidoActualizado = pedido.map(productoState => productoState.id === producto.id ? producto : productoState)
            setPedido(pedidoActualizado)
            toast.success('Guardado Correctamente', {
                autoClose: 1000,
            })
        } else {
            setPedido([...pedido,producto])
            toast.success('Agregado al Pedido', {
                autoClose: 1000,
            })
        }
        
        setModal(false)
    }


    return(
        <QuioscoContext.Provider
            value={{
                categorias,
                categoriaActual,
                handleClickCategoria,
                producto, 
                handleSetProducto,
                modal,
                handleChangeModal,
                handleAgregarPedido,
                pedido,
                handleEditarCantidades,
                handleEliminarProducto,
                nombre,
                setNombre,
                colocarOrden,
                total
            }}
        >
            {children}
        </QuioscoContext.Provider>
    )
}

export {
    QuioscoProvider
}

export default QuioscoContext