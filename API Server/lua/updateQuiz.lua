-- updateQuiz.lua (quiz, star, intervals) (now, word, coefficient)

local intervals
if redis.call('EXISTS', KEYS[3]) == 1 then
  intervals = redis.call('GET', KEYS[3])
else
  intervals = {5, 15, 60, 180, 720, 2880, 5760, 11520, 23040}
end

local star = redis.call('GET', KEYS[2])
local time = ARGV[1] + intervals[star] * (1 + ARGV[3])

return redis.call('ZADD', KEYS[1], time, ARGV[2])
