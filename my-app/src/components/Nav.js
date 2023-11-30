import React from "react";

function Nav() {
    return (
      <nav
        className="navbar "
        style={{ backgroundColor: "#7855c7", color: "white" }}
      >
        <div className="container-fluid">
          <div className="navbar-brand"> JKLM.fun </div>
          <form action="" className="d-flex">
            <span className="d-flex btn btn-primary">
              <img
                className="img-fluid p-1"
                id="user_picture"
                src="https://jklm.fun/images/auth/guest.png"
                alt=""
              />
              user name
            </span>
          </form>
        </div>
      </nav>
    );
  }

export default Nav;