from flask import Flask, render_template, request, Response
import os.path
import requests
import json
import bisect
from Executive import Executive


# hold lists of user games
games = []

# holds the leaderboard

leaderboard = []


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def main():
    """
    Main post
    Args:
        none
    Returns:
        none
    """

    if request.method == 'POST':
        return handle_request(request.form)
    if request.method == 'GET':
        return render_template('index.html')


@app.route('/api/createBoard', methods=['POST'])
def api_newboard():
    """
    Initiates game and board
    Pre:
        valid json file with user specified rows, cols, mines, and userID
    Post:
            game generated by instantiating Executive and added to list
    Args:
            none
    Returns:
            True in JSON
    """

    s = request.form.to_dict()['json_string']
    json_acceptable_string = s.replace("'", "\"")
    d = json.loads(json_acceptable_string)
    rows = (int)(d['rows'])
    cols = (int)(d['cols'])
    mines = (int)(d['mines'])
    userID = (d['userID'])

    alreadyExist = False
    for i in games:
        if i.getUserID() == userID:
            alreadyExist = True
            i.reset(rows, cols, mines, userID)
            break

    if not alreadyExist:
        # add new game to list of games
        try:
            newGame = Executive(rows, cols, mines, userID)
        except:
            return "INVALID_USER_INPUT"
        games.append(newGame)

    # POST with JSON
    return str(True)


@app.route('/api/selectSpace', methods=['POST'])
def api_selectSpace():
    """
    Handles each click on board spaces
    Pre:
        Game with userID exists in games list
    Post:
        game takes a step
    Args:
        int rows, int cols, int userID, bool rightClick
    Returns:
        "Winner" if user has won, "Loser" if user has lost, or board in json if game continues
    """

    s = request.form.to_dict()['json_string']
    # POST with JSON
    json_acceptable_string = s.replace("'", "\"")
    d = json.loads(json_acceptable_string)
    rows = (int)(d['rows'])
    cols = (int)(d['cols'])
    userID = (d['userID'])
    rightClick = (d['rightClick'] == "true")
    for i in games:
        if i.getUserID() == userID:
            # call either right or left click method
            if rightClick is True:
                i.rightClick(rows, cols)
                return str(i.getJson(False))
            else:
                i.leftClick(rows, cols)
                return str(i.getJson(False))

@app.route('/api/updateLeaderboard', methods=['POST'])
def api_updateLeaderboard():
    """
    Displays leaderboard
    Pre:
        None
    Post:
        Leaderboard is displayed
    Args:
        winTime and userID
    Returns:
        List of leaderboard times.
    """

    s = request.form.to_dict()['json_string']
    # POST with JSON
    json_acceptable_string = s.replace("'", "\"")
    d = json.loads(json_acceptable_string)
    winTime = (d['winTime'])
    if len(leaderboard) < 10:
            bisect.insort(leaderboard, winTime)
    else:
        bisect.insort(leaderboard, winTime)
        leaderboard.pop()
    return json.dumps(leaderboard)

@app.route('/api/displayLeaderboard', methods=['POST'])
def api_displayLeaderboard():
    """
    Displays leaderboard
    Pre:
        None
    Post:
        Leaderboard is displayed
    Args:
        none
    Returns:
        List of leaderboard times.
    """
    return json.dumps(leaderboard)





@app.route('/api/cheatMode', methods=['POST'])
def api_cheatmode():
    """
    Displays whole board if cheatMode is True, else shows board as normal
    Pre:
        Game with userID exists in games list
    Post:
        Game displays either full board or non-hidden board
    Args:
        int userID, bool cheatMode
    Returns:
        Full board if cheatMode is True or board in json if cheatMode is False
    """

    s = request.form.to_dict()['json_string']
    json_acceptable_string = s.replace("'", "\"")
    d = json.loads(json_acceptable_string)
    userID = (d['userID'])
    cheatMode = (d['cheatMode'])

    for i in games:
        if i.getUserID() == userID:
            # Reveal board cheat mode
            if cheatMode is True:
                return json.dumps(i.getJson(True))
            else:
                return json.dumps(i.getJson(False))


def handle_request(request_data):
    # body = request_data['Body'].strip()
    return "test"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
