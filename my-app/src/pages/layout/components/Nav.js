import React from "react";
import { Link } from "react-router-dom";

function Nav() {
    return (
      <nav
        className="navbar "
        style={{ backgroundColor: "#7855c7", color: "white" }}
      >
        <div className="container-fluid">
          <Link to="http://localhost:3000/" style={{textDecoration: "none"}}>
            <div className="navbar-brand"> FFA.fun </div>
          </Link>
          {/* <form action="" className="d-flex">
            <span className="d-flex btn btn-primary">
              <img
                className="img-fluid p-1"
                id="user_picture"
                src="https://jklm.fun/images/auth/guest.png"
                alt=""
              />
              user name
            </span>
          </form> */}
        </div>
      </nav>
    );
  }

export default Nav;