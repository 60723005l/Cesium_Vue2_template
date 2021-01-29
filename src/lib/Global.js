class Global
{
    constructor(option={})
    {
        this.init(option)
    }
    init(option)
    {
        Object.keys(option).forEach(name=>
            {
                this[name] = option[name]
            })
    }
    isItemExist(name)
    {
        return this[name] == undefined ? false : true
    }
    getItem(name)
    {
        if ( this.isItemExist(name) )
        {
            return this[name]
        }
        else
        {
            return false
        }
    }
    removeItem(name)
    {
        
        if ( this.isItemExist(name) )
        {
            this[name] = null
            return true
        }
        else
        {
            return false
        }
    }
    addItem(name,value)
    {
        if ( this.isItemExist(name) )
        {
            throw new Error( `name ${name} is  exist in Global object` )
        }
        else
        {
            this[name] = value
        }
    }
    /**
     * 
     * @param {Array} arr ex:[ {name: name1, value: value1}, {name: name2, value: value2}, ]
     */
    addItemsFromArray(arr)
    {
        arr.forEach(item=>
            {
                this.addItem(item.name, item.value)
            })
    }

}


export default new Global({
    viewer: {},
    DataCenter: {},
    GlobalLoadingBlock:
    {
        _value:false,
        set value( bool )
        {
            this._value = bool
        },
        get value()
        {
            return this._value
        }
    }
})