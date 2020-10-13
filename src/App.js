import React, {createRef} from 'react';
import './App.css';

let observer = new IntersectionObserver(function(entries, observer){
  entries.reverse().forEach(entry =>{
    if(entry.isIntersecting){
      entry.target.dispatchEvent(new Event('showing'));
    }
  })
});

class App extends React.Component {
  constructor(){
    super();
    this.ref = createRef();
    this.state = {json: [''], nextPage: 1}
  }
  componentDidMount(){
    fetch(`https://picsum.photos/v2/list?limit=20&page=${this.state.nextPage}`)
    .then(res => res.json())
    .then((json) =>{
      this.setState({json, nextPage: this.state.nextPage + 1});
    });
  }
  componentDidUpdate(){
    observer.observe(this.ref.current);
    this.ref.current.addEventListener('showing', () => {
      fetch(`https://picsum.photos/v2/list?limit=20&page=${this.state.nextPage}`)
      .then(res => res.json())
      .then((json) =>{
        this.setState({json: [...this.state.json,...json], nextPage: this.state.nextPage + 1});
      });
    })
  }
  render() {
    let images = this.state.json.map((img, idx) => <LazyImage key={idx} src={img.download_url}></LazyImage>)
    return (
    <div className="App">
      {images.map((image, idx) => idx === images.length-1 ? <div key={idx} ref={this.ref}>{image}</div> : image)}
    </div>
  )};
}


class LazyImage extends React.Component {
  constructor(){
    super();
    this.ref = createRef();
    this.state = {url: ''}
  }
  componentDidMount(){
    observer.observe(this.ref.current);

    this.ref.current.addEventListener('showing', (e) => {
      this.setState({url: this.props.src});
    })
  }
  
  shouldComponentUpdate(nextProps, nextState){
    if(this.state.url === nextState.url){
      return false;
    } else {
      return true;
    }
  }
  render(){
    let {url} = this.state;
    return (<div className="lazyImage" ref={this.ref}><img alt="random picsum" src={url}></img></div>)
  } 
}

export default App;
