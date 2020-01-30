import React from 'react';
import './search-filter.css';

class SearchFilter extends React.Component{


    state = {
        filters: [],
    }

    filterChange = (id)=>{
        if ((this.props.options.find((x)=>x.active) || {id:-1}).id===id) //если кликнули по активному
            return;

        this.props.onChange(id)
    }


    render(){
        return(
            <div style={this.props.style} className="SF-buttonsContainer">
                {this.props.options.map((el, ind, arr)=>{
                    let classList = "btn";

                    if (el.active) classList+=" btn-primary";
                    else classList+=" btn-outline-secondary";

                    if (!ind) classList+=" first";

                    if (ind===arr.length-1) classList+=" last";

                    return(
                        <button key={el.id} className={classList} onClick={()=>this.filterChange(el.id)}>{el.title}</button>
                    );
                })}
            </div>
        );
    }
}

export default SearchFilter;