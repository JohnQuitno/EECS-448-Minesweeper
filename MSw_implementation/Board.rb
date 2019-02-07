require_relative 'BoardSpace'

class Board


	#initializes the board
	def initialize(rows, cols, mines)
		@m_rows = rows
		@m_cols = cols
		@m_numMines = mines
		@m_numFlags = mines

		@m_board = Array.new(rows){Array.new(cols){BoardSpace.new()}}

	end

	#returns number of rows
	def getRows()
		return @m_rows
	end
	#returns number of columns
	def getCols()
		return @m_cols
	end
	#returns number of flags
	def getFlags()
		return @m_numFlags
	end	

	#prints board to terminal(currently)
	def printBoard()
		for x in (0...@m_rows)
			for y in (0...@m_cols)
				print @m_board[x][y].getSpace()
				print " "
			end
			print "\n"
		end	
	end
	
	#shows either bomb or number of spaces around bomb
	def showBoard()
		for x in (0...@m_rows)
			for y in (0...@m_cols)
				print @m_board[x][y].showSpace()
				print " "
			end
			print "\n"
		end	
	end
	
	#takes first step, then places all bombs
	def firstStep(xpos, ypos)
		placeBombs(xpos, ypos)
		calculateNearby()
	end
	
	#places all mines around the first space stepped on
	def placeBombs(xpos,ypos)
		
		#initializes a 1D array to randomly place bombs in indicies
		maxIndex = @m_cols * @m_rows
		minesPlaced = 0
		mineIndex = Array.new(maxIndex-1, false)

		#initializes a certian number of mines
		for x in (0...@m_numMines)
			mineIndex[x] = true
		end
		
		#shuffle the array to achieve randomness
		mineIndex = mineIndex.shuffle()
		
		#copy 1D array into 2D array, adjusting for xpos,ypos
		colision = 0
		for i in (0...@m_rows)
			for j in (0...@m_cols)
				if i == xpos && j == ypos
					colision = 1
				elsif (mineIndex[i+(j*@m_rows)-colision])
					@m_board[i][j].setMine()
				end
			end
		end
	end

	def calculateNearby()
	
	end

end

obj = Board.new(1200,1200,1200*1200-1)
obj.placeBombs(3,0)
obj.showBoard()

