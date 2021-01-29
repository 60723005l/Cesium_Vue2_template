
var testdata = `a,b,c,d,e
1,2,3,4,5
6,7,8,9,10
1,12,13,14,15`

var Parser = new Object()

var CSV = {
    parse( data = '', comma = ',' )
    {
        return data.split( '\n' ).map( row => row.split( comma ) )
    }
}
Parser.CSV = CSV





export default Parser