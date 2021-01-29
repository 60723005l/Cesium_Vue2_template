
function JaroWrinker(s1, s2) {
    var m = 0;

    // Exit early if either are empty.
    if ( s1.length === 0 || s2.length === 0 ) {
        return 0;
    }

    // Exit early if they're an exact match.
    if ( s1 === s2 ) {
        return 1;
    }

    var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
        s1Matches = new Array(s1.length),
        s2Matches = new Array(s2.length);

    for ( let i = 0; i < s1.length; i++ ) {
        var low  = (i >= range) ? i - range : 0,
            high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

        for ( let j = low; j <= high; j++ ) {
        if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
            ++m;
            s1Matches[i] = s2Matches[j] = true;
            break;
        }
        }
    }

    // Exit early if no matches were found.
    if ( m === 0 ) {
        return 0;
    }

    // Count the transpositions.
    var n_trans;
    var k = n_trans = 0;

    for ( var i = 0; i < s1.length; i++ ) {
        if ( s1Matches[i] === true ) {
        for ( var j = k; j < s2.length; j++ ) {
            if ( s2Matches[j] === true ) {
            k = j + 1;
            break;
            }
        }

        if ( s1[i] !== s2[j] ) {
            ++n_trans;
        }
        }
    }

    var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
        l      = 0,
        p      = 0.1;

    if ( weight > 0.7 ) {
        while ( s1[l] === s2[l] && l < 4 ) {
        ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}

/**
 * 
 * @param {*} target -the search pattern
 * @param {Array} search_arr - the array to be searched
 * @param {Boolean} showAll -true to return all result, false to return the most likely
 */
function FuzzySearch( target, search_arr, showAll = false )
{
    var mostLikely;
    var hightest_weight = -999;
    var resullt =  search_arr.map( item => 
        {
            let weight = JaroWrinker( target, item )
            if ( weight > hightest_weight )
            {
                hightest_weight = weight
                mostLikely = item
            }
            return{
                item, weight
            }
        } )
    if ( showAll ) 
    { return result }
    else
    { return mostLikely }

}



export default FuzzySearch
