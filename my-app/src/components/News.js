import React from "react";

function News() {
    return (
      <div className="container">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer gravida
          auctor metus, vel euismod tellus vehicula quis. Sed in cursus dui. Sed
          non maximus elit, vestibulum sollicitudin lorem. Vestibulum hendrerit,
          turpis eget mollis auctor, nibh sapien vulputate sapien, non suscipit
          risus ante eu nisi. Fusce in feugiat orci. Phasellus elementum elit
          lacinia varius dignissim. Cras tortor mi, elementum non maximus eu,
          fermentum vitae nisl.
        </p>
        <div className="row">
          <a href="#" className="col-3">
            link1
          </a>
          <a href="#" className="col-3">
            link2
          </a>
          <a href="#" className="col-3">
            link3
          </a>
          <a href="#" className="col-3">
            link4
          </a>
        </div>
      </div>
    );
  }

  export default News;