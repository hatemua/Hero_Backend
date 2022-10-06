exports.get = async function (req, res) {
  try {
    return res.send(" Videos service work fine ");
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

exports.getDetails = async function (req, res) {
  try {
    const { video } = req.params;

    // use db service to retrieve data the  send it back to client

    return res.json({ video });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};
